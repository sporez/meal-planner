import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const dbPath = path.join(process.cwd(), 'meal-planner.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  // Create categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // Create meals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category_id TEXT NOT NULL,
      difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard')),
      has_leftovers INTEGER NOT NULL DEFAULT 0,
      last_served_date TEXT,
      times_served INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    )
  `);

  // Migration: Add has_leftovers column to existing meals table
  try {
    const columns = db.pragma('table_info(meals)');
    const hasLeftoversExists = columns.some((col: any) => col.name === 'has_leftovers');

    if (!hasLeftoversExists) {
      db.exec('ALTER TABLE meals ADD COLUMN has_leftovers INTEGER NOT NULL DEFAULT 0');
      console.log('Migration: Added has_leftovers column to meals table');
    }
  } catch (error) {
    // Table might not exist yet, which is fine
  }

  // Migration: Add rating column to existing meals table
  try {
    const columns = db.pragma('table_info(meals)');
    const ratingExists = columns.some((col: any) => col.name === 'rating');

    if (!ratingExists) {
      db.exec('ALTER TABLE meals ADD COLUMN rating INTEGER CHECK(rating IS NULL OR (rating >= 1 AND rating <= 5))');
      console.log('Migration: Added rating column to meals table');
    }
  } catch (error) {
    // Table might not exist yet, which is fine
  }

  // Create meal plans table
  db.exec(`
    CREATE TABLE IF NOT EXISTS meal_plans (
      id TEXT PRIMARY KEY,
      week_start_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(week_start_date)
    )
  `);

  // Create meal plan entries (one per day)
  db.exec(`
    CREATE TABLE IF NOT EXISTS meal_plan_entries (
      id TEXT PRIMARY KEY,
      meal_plan_id TEXT NOT NULL,
      day_index INTEGER NOT NULL CHECK(day_index >= 0 AND day_index < 7),
      meal_id TEXT NOT NULL,
      FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
      FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
      UNIQUE(meal_plan_id, day_index)
    )
  `);

  console.log('Database initialized successfully');
  seedDefaultCategories();
}

function seedDefaultCategories() {
  const defaultCategories = [
    { name: 'Asian', color: '#EF4444' },      // Red
    { name: 'Mexican', color: '#F59E0B' },    // Orange
    { name: 'Italian', color: '#10B981' },    // Green
    { name: 'Pasta', color: '#3B82F6' },      // Blue
    { name: 'Soup', color: '#8B5CF6' },       // Purple
    { name: 'Salad', color: '#14B8A6' }       // Teal
  ];

  const checkStmt = db.prepare('SELECT COUNT(*) as count FROM categories');
  const result = checkStmt.get() as { count: number };

  if (result.count === 0) {
    const insertStmt = db.prepare(`
      INSERT INTO categories (id, name, color, created_at)
      VALUES (?, ?, ?, ?)
    `);

    for (const category of defaultCategories) {
      const id = crypto.randomUUID();
      insertStmt.run(id, category.name, category.color, new Date().toISOString());
    }
    console.log('Default categories seeded');
  }
}

export default db;
