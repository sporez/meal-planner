import express from 'express';
import cors from 'cors';
import path from 'path';
import { initializeDatabase } from './db/database';
import categoriesRouter from './routes/categories';
import mealsRouter from './routes/meals';
import mealPlansRouter from './routes/mealPlans';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Initialize database
initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/categories', categoriesRouter);
app.use('/api/meals', mealsRouter);
app.use('/api/meal-plans', mealPlansRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static files from the frontend build
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Backend API available at http://localhost:${PORT}`);
});
