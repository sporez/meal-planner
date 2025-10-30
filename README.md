# Meal Planner

An intelligent meal planning application that helps you organize meals and generate weekly meal plans with smart scheduling.

## Features

### Phase 1 (Current)
- Add, view, and delete meals
- Categorize meals (Asian, Mexican, Italian, Pasta, Soup, Salad)
- Set difficulty levels (easy, medium, hard)
- Track meal frequency

### Coming Soon (Phase 2)
- Intelligent weekly meal generation
- Avoid meal repetition with smart spacing
- Category diversity in weekly plans
- Meal history tracking

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: SQLite with better-sqlite3

## Setup

### Prerequisites
- Node.js 18+ installed

### Installation

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

You'll need two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
App runs on http://localhost:3000

## Project Structure

```
meal-planner/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── database.ts       # Database setup & initialization
│   │   ├── routes/
│   │   │   ├── categories.ts     # Category API endpoints
│   │   │   └── meals.ts          # Meal API endpoints
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript types
│   │   └── index.ts              # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddMealForm.tsx   # Form to add meals
│   │   │   └── MealList.tsx      # Display all meals
│   │   ├── services/
│   │   │   └── api.ts            # API client
│   │   ├── App.tsx               # Main app component
│   │   ├── main.tsx              # Entry point
│   │   ├── types.ts              # TypeScript types
│   │   └── index.css             # Global styles
│   └── package.json
└── README.md
```

## Database Schema

### Tables

**categories**
- id (TEXT, PRIMARY KEY)
- name (TEXT, UNIQUE)
- color (TEXT)
- created_at (TEXT)

**meals**
- id (TEXT, PRIMARY KEY)
- name (TEXT)
- category_id (TEXT, FOREIGN KEY)
- difficulty (TEXT: easy/medium/hard)
- last_served_date (TEXT, nullable)
- times_served (INTEGER)
- created_at (TEXT)

**meal_plans** (Phase 2)
- id (TEXT, PRIMARY KEY)
- week_start_date (TEXT, UNIQUE)
- created_at (TEXT)

**meal_plan_entries** (Phase 2)
- id (TEXT, PRIMARY KEY)
- meal_plan_id (TEXT, FOREIGN KEY)
- day_index (INTEGER: 0-6)
- meal_id (TEXT, FOREIGN KEY)

## API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a category
- `DELETE /api/categories/:id` - Delete a category

### Meals
- `GET /api/meals` - Get all meals
- `GET /api/meals/:id` - Get a specific meal
- `POST /api/meals` - Create a meal
- `PUT /api/meals/:id` - Update a meal
- `DELETE /api/meals/:id` - Delete a meal

## Development Phases

### Phase 1: Foundation ✅
- Project setup
- Database schema
- CRUD operations for meals
- Basic UI

### Phase 2: Planning (Next)
- Meal generation algorithm
- Week view calendar
- Track meal history

### Phase 3: Polish
- Category management in settings
- Edit meals
- Manual meal override

### Phase 4: Enhancement
- Statistics and analytics
- Export functionality
- Shopping list generation
