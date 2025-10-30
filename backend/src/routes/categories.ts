import { Router } from 'express';
import db from '../db/database';
import { Category, CreateCategoryRequest } from '../types';
import { randomUUID } from 'crypto';

const router = Router();

// Get all categories
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM categories ORDER BY name');
    const rows = stmt.all() as any[];

    const categories: Category[] = rows.map(row => ({
      id: row.id,
      name: row.name,
      color: row.color,
      createdAt: row.created_at
    }));

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create a new category
router.post('/', (req, res) => {
  try {
    const { name, color } = req.body as CreateCategoryRequest;

    if (!name || !color) {
      return res.status(400).json({ error: 'Name and color are required' });
    }

    const id = randomUUID();
    const createdAt = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO categories (id, name, color, created_at)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(id, name, color, createdAt);

    const category: Category = { id, name, color, createdAt };
    res.status(201).json(category);
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Category with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Delete a category
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Check if any meals use this category
    const checkStmt = db.prepare('SELECT COUNT(*) as count FROM meals WHERE category_id = ?');
    const result = checkStmt.get(id) as { count: number };

    if (result.count > 0) {
      return res.status(409).json({
        error: 'Cannot delete category that is used by meals'
      });
    }

    const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
    const info = stmt.run(id);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
