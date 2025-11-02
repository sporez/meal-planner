import { Router } from 'express';
import db from '../db/database';
import { MealPlan, MealWithCategory } from '../types';
import { MealGenerator } from '../services/mealGenerator';
import { randomUUID } from 'crypto';

const router = Router();

/**
 * Generate a new meal plan for a specific week
 * POST /api/meal-plans/generate
 * Body: { weekStartDate: "2024-01-01" } (Sunday's date)
 */
router.post('/generate', (req, res) => {
  try {
    const { weekStartDate, avoidSameMealDays, maxCategoryPerWeek } = req.body;

    if (!weekStartDate) {
      return res.status(400).json({ error: 'weekStartDate is required (YYYY-MM-DD format)' });
    }

    // Validate it's a Sunday (parse in local time to avoid timezone issues)
    const [year, month, day] = weekStartDate.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    if (date.getDay() !== 0) {
      return res.status(400).json({ error: 'weekStartDate must be a Sunday' });
    }

    // Pass optional settings to generator
    const generator = new MealGenerator({
      avoidSameMealDays,
      maxCategoryPerWeek,
    });
    const meals = generator.generateWeek(weekStartDate);

    // Return the generated plan (not saved yet)
    const plan: MealPlan = {
      id: 'preview',
      weekStartDate,
      meals,
      createdAt: new Date().toISOString(),
    };

    res.json(plan);
  } catch (error: any) {
    console.error('Error generating meal plan:', error);
    res.status(500).json({ error: error.message || 'Failed to generate meal plan' });
  }
});

/**
 * Save/confirm a meal plan
 * POST /api/meal-plans
 * Body: { weekStartDate: "2024-01-01", mealIds: ["id1", "id2", ...] }
 */
router.post('/', (req, res) => {
  try {
    const { weekStartDate, mealIds } = req.body;

    if (!weekStartDate || !mealIds || !Array.isArray(mealIds)) {
      return res.status(400).json({
        error: 'weekStartDate and mealIds array are required'
      });
    }

    if (mealIds.length !== 7) {
      return res.status(400).json({ error: 'Exactly 7 meals required for a week' });
    }

    const planId = randomUUID();
    const createdAt = new Date().toISOString();

    // Start transaction
    const insertPlan = db.prepare(`
      INSERT INTO meal_plans (id, week_start_date, created_at)
      VALUES (?, ?, ?)
    `);

    const insertEntry = db.prepare(`
      INSERT INTO meal_plan_entries (id, meal_plan_id, day_index, meal_id)
      VALUES (?, ?, ?, ?)
    `);

    const updateMeal = db.prepare(`
      UPDATE meals
      SET last_served_date = ?,
          times_served = times_served + 1
      WHERE id = ?
    `);

    // Use transaction for data consistency
    const transaction = db.transaction(() => {
      // Insert meal plan
      insertPlan.run(planId, weekStartDate, createdAt);

      // Insert meal plan entries and update meal stats
      mealIds.forEach((mealId, index) => {
        const entryId = randomUUID();
        insertEntry.run(entryId, planId, index, mealId);

        // Update meal's last served date and count
        const dayDate = new Date(weekStartDate);
        dayDate.setDate(dayDate.getDate() + index);
        updateMeal.run(dayDate.toISOString(), mealId);
      });
    });

    transaction();

    // Fetch the created plan
    const plan = getMealPlan(planId);
    res.status(201).json(plan);
  } catch (error: any) {
    console.error('Error saving meal plan:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        error: 'A meal plan already exists for this week'
      });
    }
    res.status(500).json({ error: 'Failed to save meal plan' });
  }
});

/**
 * Get all meal plans
 * GET /api/meal-plans
 */
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM meal_plans ORDER BY week_start_date DESC');
    const rows = stmt.all() as any[];

    const plans: MealPlan[] = rows.map(row => {
      const meals = getMealPlanMeals(row.id);
      return {
        id: row.id,
        weekStartDate: row.week_start_date,
        meals,
        createdAt: row.created_at,
      };
    });

    res.json(plans);
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    res.status(500).json({ error: 'Failed to fetch meal plans' });
  }
});

/**
 * Get a specific meal plan
 * GET /api/meal-plans/:id
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const plan = getMealPlan(id);

    if (!plan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    res.status(500).json({ error: 'Failed to fetch meal plan' });
  }
});

/**
 * Delete a meal plan
 * DELETE /api/meal-plans/:id
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM meal_plans WHERE id = ?');
    const info = stmt.run(id);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    res.status(500).json({ error: 'Failed to delete meal plan' });
  }
});

// Helper functions

function getMealPlan(planId: string): MealPlan | null {
  const stmt = db.prepare('SELECT * FROM meal_plans WHERE id = ?');
  const row = stmt.get(planId) as any;

  if (!row) {
    return null;
  }

  const meals = getMealPlanMeals(planId);

  return {
    id: row.id,
    weekStartDate: row.week_start_date,
    meals,
    createdAt: row.created_at,
  };
}

function getMealPlanMeals(planId: string): MealWithCategory[] {
  const stmt = db.prepare(`
    SELECT
      m.id,
      m.name,
      m.category_id,
      m.difficulty,
      m.has_leftovers,
      m.rating,
      m.last_served_date,
      m.times_served,
      m.created_at,
      c.name as category_name,
      c.color as category_color,
      mpe.day_index
    FROM meal_plan_entries mpe
    JOIN meals m ON mpe.meal_id = m.id
    JOIN categories c ON m.category_id = c.id
    WHERE mpe.meal_plan_id = ?
    ORDER BY mpe.day_index
  `);

  const rows = stmt.all(planId) as any[];

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    difficulty: row.difficulty,
    hasLeftovers: Boolean(row.has_leftovers),
    rating: row.rating,
    lastServedDate: row.last_served_date,
    timesServed: row.times_served,
    createdAt: row.created_at,
    categoryName: row.category_name,
    categoryColor: row.category_color,
  }));
}

export default router;
