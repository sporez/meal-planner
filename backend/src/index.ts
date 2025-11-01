import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db/database';
import categoriesRouter from './routes/categories';
import mealsRouter from './routes/meals';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/categories', categoriesRouter);
app.use('/api/meals', mealsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Backend API available at http://localhost:${PORT}`);
});
