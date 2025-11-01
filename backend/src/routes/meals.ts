import { Router } from 'express';
import db from '../db/database';
import { Meal, MealWithCategory, CreateMealRequest, UpdateMealRequest } from '../types';
import { randomUUID } from 'crypto';

const router = Router();

// Get all meals (with category info)
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT
        m.id,
        m.name,
        m.category_id,
        m.difficulty,
        m.has_leftovers,
        m.last_served_date,
        m.times_served,
        m.created_at,
        c.name as category_name,
        c.color as category_color
      FROM meals m
      JOIN categories c ON m.category_id = c.id
      ORDER BY m.name
    `);

    const rows = stmt.all() as any[];

    const meals: MealWithCategory[] = rows.map(row => ({
      id: row.id,
      name: row.name,
      categoryId: row.category_id,
      difficulty: row.difficulty,
      hasLeftovers: Boolean(row.has_leftovers),
      lastServedDate: row.last_served_date,
      timesServed: row.times_served,
      createdAt: row.created_at,
      categoryName: row.category_name,
      categoryColor: row.category_color
    }));

    res.json(meals);
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// Get a single meal by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare(`
      SELECT
        m.id,
        m.name,
        m.category_id,
        m.difficulty,
        m.has_leftovers,
        m.last_served_date,
        m.times_served,
        m.created_at,
        c.name as category_name,
        c.color as category_color
      FROM meals m
      JOIN categories c ON m.category_id = c.id
      WHERE m.id = ?
    `);

    const row = stmt.get(id) as any;

    if (!row) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    const meal: MealWithCategory = {
      id: row.id,
      name: row.name,
      categoryId: row.category_id,
      difficulty: row.difficulty,
      hasLeftovers: Boolean(row.has_leftovers),
      lastServedDate: row.last_served_date,
      timesServed: row.times_served,
      createdAt: row.created_at,
      categoryName: row.category_name,
      categoryColor: row.category_color
    };

    res.json(meal);
  } catch (error) {
    console.error('Error fetching meal:', error);
    res.status(500).json({ error: 'Failed to fetch meal' });
  }
});

// Create a new meal
router.post('/', (req, res) => {
  try {
    const { name, categoryId, difficulty, hasLeftovers } = req.body as CreateMealRequest;

    if (!name || !categoryId || !difficulty) {
      return res.status(400).json({
        error: 'Name, categoryId, and difficulty are required'
      });
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({
        error: 'Difficulty must be easy, medium, or hard'
      });
    }

    // Check if category exists
    const categoryStmt = db.prepare('SELECT id FROM categories WHERE id = ?');
    const category = categoryStmt.get(categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const hasLeftoversValue = hasLeftovers ? 1 : 0;

    const stmt = db.prepare(`
      INSERT INTO meals (id, name, category_id, difficulty, has_leftovers, times_served, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `);

    stmt.run(id, name, categoryId, difficulty, hasLeftoversValue, createdAt);

    // Fetch the created meal with category info
    const getMealStmt = db.prepare(`
      SELECT
        m.id,
        m.name,
        m.category_id,
        m.difficulty,
        m.has_leftovers,
        m.last_served_date,
        m.times_served,
        m.created_at,
        c.name as category_name,
        c.color as category_color
      FROM meals m
      JOIN categories c ON m.category_id = c.id
      WHERE m.id = ?
    `);

    const row = getMealStmt.get(id) as any;

    const meal: MealWithCategory = {
      id: row.id,
      name: row.name,
      categoryId: row.category_id,
      difficulty: row.difficulty,
      hasLeftovers: Boolean(row.has_leftovers),
      lastServedDate: row.last_served_date,
      timesServed: row.times_served,
      createdAt: row.created_at,
      categoryName: row.category_name,
      categoryColor: row.category_color
    };

    res.status(201).json(meal);
  } catch (error) {
    console.error('Error creating meal:', error);
    res.status(500).json({ error: 'Failed to create meal' });
  }
});

// Update a meal
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body as UpdateMealRequest;

    // Check if meal exists
    const checkStmt = db.prepare('SELECT id FROM meals WHERE id = ?');
    const meal = checkStmt.get(id);

    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      updateFields.push('name = ?');
      values.push(updates.name);
    }

    if (updates.categoryId !== undefined) {
      // Check if category exists
      const categoryStmt = db.prepare('SELECT id FROM categories WHERE id = ?');
      const category = categoryStmt.get(updates.categoryId);

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      updateFields.push('category_id = ?');
      values.push(updates.categoryId);
    }

    if (updates.difficulty !== undefined) {
      if (!['easy', 'medium', 'hard'].includes(updates.difficulty)) {
        return res.status(400).json({
          error: 'Difficulty must be easy, medium, or hard'
        });
      }

      updateFields.push('difficulty = ?');
      values.push(updates.difficulty);
    }

    if (updates.hasLeftovers !== undefined) {
      updateFields.push('has_leftovers = ?');
      values.push(updates.hasLeftovers ? 1 : 0);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);

    const stmt = db.prepare(`
      UPDATE meals
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    // Fetch the updated meal
    const getMealStmt = db.prepare(`
      SELECT
        m.id,
        m.name,
        m.category_id,
        m.difficulty,
        m.has_leftovers,
        m.last_served_date,
        m.times_served,
        m.created_at,
        c.name as category_name,
        c.color as category_color
      FROM meals m
      JOIN categories c ON m.category_id = c.id
      WHERE m.id = ?
    `);

    const row = getMealStmt.get(id) as any;

    const updatedMeal: MealWithCategory = {
      id: row.id,
      name: row.name,
      categoryId: row.category_id,
      difficulty: row.difficulty,
      hasLeftovers: Boolean(row.has_leftovers),
      lastServedDate: row.last_served_date,
      timesServed: row.times_served,
      createdAt: row.created_at,
      categoryName: row.category_name,
      categoryColor: row.category_color
    };

    res.json(updatedMeal);
  } catch (error) {
    console.error('Error updating meal:', error);
    res.status(500).json({ error: 'Failed to update meal' });
  }
});

// Delete a meal
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM meals WHERE id = ?');
    const info = stmt.run(id);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
});

// Reset all meal statistics (lastServedDate and timesServed)
router.post('/reset-stats', (req, res) => {
  try {
    const stmt = db.prepare(`
      UPDATE meals
      SET last_served_date = NULL,
          times_served = 0
    `);

    const info = stmt.run();

    res.json({
      message: 'Meal statistics reset successfully',
      mealsUpdated: info.changes
    });
  } catch (error) {
    console.error('Error resetting meal stats:', error);
    res.status(500).json({ error: 'Failed to reset meal statistics' });
  }
});

export default router;
