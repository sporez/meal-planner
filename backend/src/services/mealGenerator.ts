import db from '../db/database';
import { MealWithCategory } from '../types';

interface MealScore {
  meal: MealWithCategory;
  score: number;
  reasons: string[];
}

interface GenerateOptions {
  weekStartDate: string; // ISO date string for Monday
  avoidSameMealDays?: number; // Minimum days between same meal (default 10)
  maxCategoryPerWeek?: number; // Max times same category per week (default 2)
}

/**
 * Intelligent meal generation algorithm
 * Scores meals based on:
 * 1. Recency - when was it last served
 * 2. Frequency - how often has it been served overall
 * 3. Category diversity - avoid repeating categories
 */
export class MealGenerator {
  private avoidSameMealDays: number;
  private maxCategoryPerWeek: number;

  constructor(options: Partial<GenerateOptions> = {}) {
    this.avoidSameMealDays = options.avoidSameMealDays || 10;
    this.maxCategoryPerWeek = options.maxCategoryPerWeek || 2;
  }

  /**
   * Generate a week of meals (7 days)
   */
  generateWeek(weekStartDate: string): MealWithCategory[] {
    const allMeals = this.getAllMeals();

    if (allMeals.length === 0) {
      throw new Error('No meals available. Please add some meals first.');
    }

    const selectedMeals: MealWithCategory[] = [];
    const usedCategories: Map<string, number> = new Map();

    // Generate meal for each day (Monday through Sunday)
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const availableMeals = this.filterAvailableMeals(
        allMeals,
        selectedMeals,
        usedCategories
      );

      if (availableMeals.length === 0) {
        // If we run out of valid options, reset constraints and try again
        const fallbackMeals = allMeals.filter(
          m => !selectedMeals.find(s => s.id === m.id) // Just avoid same meal in same week
        );

        if (fallbackMeals.length > 0) {
          const meal = this.selectRandomFromTop(fallbackMeals, 3);
          selectedMeals.push(meal);
          usedCategories.set(meal.categoryId, (usedCategories.get(meal.categoryId) || 0) + 1);
          continue;
        } else {
          // Absolute fallback - allow repeats
          const meal = allMeals[Math.floor(Math.random() * allMeals.length)];
          selectedMeals.push(meal);
          continue;
        }
      }

      // Score all available meals
      const scoredMeals = availableMeals.map(meal =>
        this.scoreMeal(meal, selectedMeals, usedCategories, dayIndex)
      );

      // Sort by score (highest first)
      scoredMeals.sort((a, b) => b.score - a.score);

      // Select from top 5 meals with some randomization for variety
      const selectedMeal = this.selectRandomFromTop(
        scoredMeals.map(sm => sm.meal),
        5
      );

      selectedMeals.push(selectedMeal);
      usedCategories.set(selectedMeal.categoryId, (usedCategories.get(selectedMeal.categoryId) || 0) + 1);
    }

    return selectedMeals;
  }

  /**
   * Get all meals from database
   */
  private getAllMeals(): MealWithCategory[] {
    const stmt = db.prepare(`
      SELECT
        m.id,
        m.name,
        m.category_id,
        m.difficulty,
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

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      categoryId: row.category_id,
      difficulty: row.difficulty,
      lastServedDate: row.last_served_date,
      timesServed: row.times_served,
      createdAt: row.created_at,
      categoryName: row.category_name,
      categoryColor: row.category_color,
    }));
  }

  /**
   * Filter meals that are available based on constraints
   */
  private filterAvailableMeals(
    allMeals: MealWithCategory[],
    selectedMeals: MealWithCategory[],
    usedCategories: Map<string, number>
  ): MealWithCategory[] {
    const now = new Date();
    const previousMeal = selectedMeals[selectedMeals.length - 1];

    return allMeals.filter(meal => {
      // Don't use same meal twice in same week
      if (selectedMeals.find(m => m.id === meal.id)) {
        return false;
      }

      // Check if meal was served too recently
      if (meal.lastServedDate) {
        const lastServed = new Date(meal.lastServedDate);
        const daysSinceServed = Math.floor((now.getTime() - lastServed.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceServed < this.avoidSameMealDays) {
          return false;
        }
      }

      // Don't use same category on consecutive days
      if (previousMeal && meal.categoryId === previousMeal.categoryId) {
        return false;
      }

      // Don't exceed max category usage per week
      const categoryUsage = usedCategories.get(meal.categoryId) || 0;
      if (categoryUsage >= this.maxCategoryPerWeek) {
        return false;
      }

      return true;
    });
  }

  /**
   * Score a meal based on multiple factors
   */
  private scoreMeal(
    meal: MealWithCategory,
    selectedMeals: MealWithCategory[],
    usedCategories: Map<string, number>,
    dayIndex: number
  ): MealScore {
    let score = 0;
    const reasons: string[] = [];

    // Factor 1: Recency (higher score for meals not served recently)
    if (!meal.lastServedDate) {
      score += 100;
      reasons.push('Never served before');
    } else {
      const lastServed = new Date(meal.lastServedDate);
      const now = new Date();
      const daysSinceServed = Math.floor((now.getTime() - lastServed.getTime()) / (1000 * 60 * 60 * 24));

      // Exponential scoring: more days = higher score
      const recencyScore = Math.min(100, daysSinceServed * 3);
      score += recencyScore;
      reasons.push(`Last served ${daysSinceServed} days ago (+${recencyScore.toFixed(0)})`);
    }

    // Factor 2: Frequency (prefer meals that haven't been served as often)
    const avgTimesServed = 5; // Assume average after some usage
    const frequencyScore = Math.max(0, 50 - (meal.timesServed - avgTimesServed) * 5);
    score += frequencyScore;
    reasons.push(`Served ${meal.timesServed} times (+${frequencyScore.toFixed(0)})`);

    // Factor 3: Category diversity (bonus for categories used less this week)
    const categoryUsage = usedCategories.get(meal.categoryId) || 0;
    const diversityScore = (this.maxCategoryPerWeek - categoryUsage) * 20;
    score += diversityScore;
    if (categoryUsage > 0) {
      reasons.push(`Category used ${categoryUsage}x this week (+${diversityScore.toFixed(0)})`);
    } else {
      reasons.push(`Fresh category this week (+${diversityScore.toFixed(0)})`);
    }

    // Factor 4: Difficulty distribution (mix easy and hard meals)
    const difficultyScore = this.getDifficultyScore(meal.difficulty, selectedMeals, dayIndex);
    score += difficultyScore;
    reasons.push(`Difficulty balance (+${difficultyScore.toFixed(0)})`);

    return { meal, score, reasons };
  }

  /**
   * Get score bonus for difficulty distribution
   */
  private getDifficultyScore(
    difficulty: string,
    selectedMeals: MealWithCategory[],
    dayIndex: number
  ): number {
    // Prefer easier meals on weekdays (indices 0-4), harder on weekends (5-6)
    const isWeekend = dayIndex >= 5;

    if (isWeekend && difficulty === 'hard') {
      return 15;
    } else if (!isWeekend && difficulty === 'easy') {
      return 15;
    } else if (difficulty === 'medium') {
      return 10; // Medium is always good
    }

    return 5;
  }

  /**
   * Select a random meal from the top N scored meals for variety
   */
  private selectRandomFromTop<T>(items: T[], topN: number): T {
    const pool = items.slice(0, Math.min(topN, items.length));
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
