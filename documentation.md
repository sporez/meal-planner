====== Meal Planner Application Documentation ======

===== Overview =====

The Meal Planner is a full-stack web application for managing meals, categories, and weekly meal planning. It features a React + TypeScript frontend with Vite, and an Express + SQLite backend. The application is designed to help users organize meals by category, track serving history, and plan meals for the week.

**Production URL:** ''meals.sporez.us''

===== Architecture =====

==== Technology Stack ====

  * **Frontend:**
    * React 18.2.0
    * TypeScript 5.3.3
    * Vite 5.0.8 (build tool and dev server)
    * Tailwind CSS 3.4.0
    * Runs on port 3000

  * **Backend:**
    * Node.js with Express 4.18.2
    * TypeScript 5.3.3
    * better-sqlite3 9.2.2 (SQLite database)
    * CORS enabled
    * Runs on port 3001

  * **Process Management:**
    * PM2 (Process Manager 2) version 6.0.13
    * Configured for production deployment

==== Project Structure ====

<code>
meal-planner/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── database.ts          # Database initialization & schema
│   │   ├── routes/
│   │   │   ├── categories.ts        # Category CRUD endpoints
│   │   │   ├── meals.ts             # Meal CRUD endpoints
│   │   │   └── mealPlans.ts         # Meal plan endpoints
│   │   ├── services/
│   │   │   └── mealGenerator.ts     # Meal generation logic
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript type definitions
│   │   └── index.ts                 # Express app entry point
│   ├── dist/                         # Compiled JavaScript output
│   ├── logs/                         # PM2 log files
│   ├── meal-planner.db              # SQLite database file
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddMealForm.tsx      # Add new meal form
│   │   │   ├── CategoryManager.tsx  # Category management UI
│   │   │   ├── EditMealModal.tsx    # Edit existing meal
│   │   │   ├── MealList.tsx         # Display meal list
│   │   │   ├── MealSelectorModal.tsx # Meal selection dialog
│   │   │   ├── SavedPlans.tsx       # View saved meal plans
│   │   │   ├── SettingsModal.tsx    # App settings
│   │   │   ├── StarRating.tsx       # Star rating component
│   │   │   └── WeeklyPlanner.tsx    # Weekly meal planning UI
│   │   ├── services/
│   │   │   └── api.ts               # API client functions
│   │   ├── App.tsx                  # Main app component
│   │   └── main.tsx                 # React entry point
│   ├── dist/                         # Production build output
│   ├── logs/                         # PM2 log files
│   ├── package.json
│   ├── vite.config.ts               # Vite configuration
│   └── tsconfig.json
├── ecosystem.config.cjs              # PM2 configuration
└── package.json                      # Root package.json
</code>

===== Database Structure =====

The application uses SQLite with better-sqlite3. Database file: ''backend/meal-planner.db''

==== Schema ====

=== categories ===

Stores meal categories (Asian, Mexican, Italian, etc.)

^ Column       ^ Type    ^ Constraints           ^ Description                    ^
| id           | TEXT    | PRIMARY KEY           | UUID                           |
| name         | TEXT    | NOT NULL, UNIQUE      | Category name                  |
| color        | TEXT    | NOT NULL              | Hex color code (e.g. #EF4444) |
| created_at   | TEXT    | NOT NULL              | ISO 8601 timestamp             |

=== meals ===

Stores individual meal recipes

^ Column            ^ Type    ^ Constraints                                    ^ Description                           ^
| id                | TEXT    | PRIMARY KEY                                    | UUID                                  |
| name              | TEXT    | NOT NULL                                       | Meal name                             |
| category_id       | TEXT    | NOT NULL, FOREIGN KEY → categories(id)         | Reference to category                 |
| difficulty        | TEXT    | NOT NULL, CHECK(easy/medium/hard)              | Cooking difficulty                    |
| has_leftovers     | INTEGER | NOT NULL, DEFAULT 0                            | Boolean (0/1) - has leftovers         |
| last_served_date  | TEXT    |                                                | ISO 8601 timestamp of last serving    |
| times_served      | INTEGER | NOT NULL, DEFAULT 0                            | Count of times served                 |
| rating            | INTEGER | CHECK(NULL or 1-5)                             | 1-5 star rating                       |
| created_at        | TEXT    | NOT NULL                                       | ISO 8601 timestamp                    |

=== meal_plans ===

Stores weekly meal plans

^ Column           ^ Type    ^ Constraints              ^ Description                       ^
| id               | TEXT    | PRIMARY KEY              | UUID                              |
| week_start_date  | TEXT    | NOT NULL, UNIQUE         | ISO 8601 date (Monday of week)    |
| created_at       | TEXT    | NOT NULL                 | ISO 8601 timestamp                |

=== meal_plan_entries ===

Stores individual days within a meal plan (7 entries per plan)

^ Column         ^ Type    ^ Constraints                                    ^ Description                    ^
| id             | TEXT    | PRIMARY KEY                                    | UUID                           |
| meal_plan_id   | TEXT    | NOT NULL, FOREIGN KEY → meal_plans(id)         | Reference to meal plan         |
| day_index      | INTEGER | NOT NULL, CHECK(0-6)                           | Day of week (0=Monday, 6=Sunday) |
| meal_id        | TEXT    | NOT NULL, FOREIGN KEY → meals(id)              | Reference to meal              |
|                |         | UNIQUE(meal_plan_id, day_index)                | One meal per day               |

==== Foreign Key Relationships ====

  * ''meals.category_id'' → ''categories.id'' (ON DELETE RESTRICT)
  * ''meal_plan_entries.meal_plan_id'' → ''meal_plans.id'' (ON DELETE CASCADE)
  * ''meal_plan_entries.meal_id'' → ''meals.id'' (ON DELETE CASCADE)

==== Default Seed Data ====

On first run, the following categories are auto-created:

  * Asian (#EF4444 - Red)
  * Mexican (#F59E0B - Orange)
  * Italian (#10B981 - Green)
  * Pasta (#3B82F6 - Blue)
  * Soup (#8B5CF6 - Purple)
  * Salad (#14B8A6 - Teal)

===== API Endpoints =====

Base URL: ''http://localhost:3001/api''

==== Health Check ====

  * ''GET /api/health'' - Returns ''{"status": "ok"}''

==== Categories ====

  * ''GET /api/categories'' - List all categories
  * ''POST /api/categories'' - Create new category
  * ''PUT /api/categories/:id'' - Update category
  * ''DELETE /api/categories/:id'' - Delete category

==== Meals ====

  * ''GET /api/meals'' - List all meals
  * ''GET /api/meals/:id'' - Get single meal
  * ''POST /api/meals'' - Create new meal
  * ''PUT /api/meals/:id'' - Update meal
  * ''DELETE /api/meals/:id'' - Delete meal
  * ''POST /api/meals/reset-statistics'' - Reset serving statistics
  * ''POST /api/meals/:id/generate-plan'' - Generate meal plan

==== Meal Plans ====

  * ''GET /api/meal-plans'' - List all saved meal plans
  * ''GET /api/meal-plans/:weekStartDate'' - Get plan for specific week
  * ''POST /api/meal-plans'' - Save new meal plan
  * ''PUT /api/meal-plans/:id'' - Update meal plan
  * ''DELETE /api/meal-plans/:id'' - Delete meal plan

===== Installation & Setup =====

==== Prerequisites ====

  * Node.js (v20.x recommended)
  * npm (comes with Node.js)
  * PM2 process manager (''npm install -g pm2'')

==== Initial Setup ====

<code bash>
# 1. Clone or extract the application
cd /home/neil/meals

# 2. Install all dependencies (root, backend, and frontend)
npm run install:all

# 3. Build the backend TypeScript code
cd backend
npm run build
cd ..

# 4. Build the frontend for production
cd frontend
npm run build
cd ..
</code>

===== Running the Application =====

==== Development Mode ====

For local development with hot-reload:

<code bash>
# Run both backend and frontend in development mode (from project root)
npm run dev

# OR run them separately:
npm run dev:backend    # Backend only on http://localhost:3001
npm run dev:frontend   # Frontend only on http://localhost:3000
</code>

==== Production Mode with PM2 ====

The application uses **PM2** for process management in production.

=== PM2 Configuration ===

File: ''ecosystem.config.cjs''

Two processes are configured:
  - **meal-planner-backend**: Runs the compiled Express server (''npm start'')
  - **meal-planner-frontend**: Runs the Vite preview server (''npm run preview'')

Both processes:
  * Auto-restart on failure
  * Maximum 10 restarts
  * Minimum uptime 10 seconds
  * Cluster mode enabled
  * Logs stored in ''./logs/'' directories

=== PM2 Commands ===

<code bash>
# Start both frontend and backend
pm2 start ecosystem.config.cjs

# View process status
pm2 status

# View logs
pm2 logs                              # All logs
pm2 logs meal-planner-backend         # Backend logs only
pm2 logs meal-planner-frontend        # Frontend logs only

# Monitor processes in real-time
pm2 monit

# Restart processes
pm2 restart ecosystem.config.cjs      # Restart all
pm2 restart meal-planner-backend      # Restart backend only
pm2 restart meal-planner-frontend     # Restart frontend only

# Stop processes
pm2 stop ecosystem.config.cjs         # Stop all
pm2 stop meal-planner-backend         # Stop backend only

# Delete processes from PM2
pm2 delete ecosystem.config.cjs       # Remove all
pm2 delete meal-planner-backend       # Remove backend only

# Save PM2 process list (persist across reboots)
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions printed by the command above
</code>

=== Log Files ===

Logs are stored in the respective ''logs/'' directories:

  * Backend logs: ''backend/logs/backend-error.log'' and ''backend/logs/backend-out.log''
  * Frontend logs: ''frontend/logs/frontend-error.log'' and ''frontend/logs/frontend-out.log''

===== Port Configuration =====

^ Service  ^ Development Port ^ Production Port ^ Binding      ^
| Frontend | 3000             | 3000            | 0.0.0.0      |
| Backend  | 3001             | 3001            | 0.0.0.0      |

  * Frontend proxies ''/api'' requests to backend (configured in ''vite.config.ts'')
  * Production frontend allows host ''meals.sporez.us''
  * Both services bind to ''0.0.0.0'' for external access

===== Environment Variables =====

==== Backend ====

  * ''PORT'' - Backend port (default: 3001)
  * ''NODE_ENV'' - Set to ''production'' by PM2

==== Frontend ====

Vite configuration handles API proxy:
  * Dev/Preview: Proxies ''/api'' → ''http://localhost:3001''

===== Building for Production =====

<code bash>
# Build backend (TypeScript → JavaScript)
cd backend
npm run build    # Output: backend/dist/

# Build frontend (React + Vite → Static files)
cd frontend
npm run build    # Output: frontend/dist/
</code>

===== Troubleshooting =====

==== Database Issues ====

<code bash>
# Database file location
ls -la backend/meal-planner.db

# Backup database
cp backend/meal-planner.db backend/meal-planner.db.bak

# Check foreign key constraints
sqlite3 backend/meal-planner.db "PRAGMA foreign_keys;"

# View all tables
sqlite3 backend/meal-planner.db ".tables"
</code>

==== Port Conflicts ====

<code bash>
# Check what's using port 3000
lsof -i :3000

# Check what's using port 3001
lsof -i :3001

# Kill process on port
kill -9 <PID>
</code>

==== PM2 Not Starting ====

<code bash>
# Check PM2 status
pm2 status

# View detailed logs
pm2 logs --lines 100

# Reset PM2
pm2 kill
pm2 start ecosystem.config.cjs

# Verify builds exist
ls -la backend/dist/
ls -la frontend/dist/
</code>

==== Frontend Not Connecting to Backend ====

  - Verify backend is running: ''curl http://localhost:3001/api/health''
  - Check proxy configuration in ''frontend/vite.config.ts''
  - Check browser console for CORS errors
  - Verify backend has CORS enabled (''backend/src/index.ts'')

===== Data Backup & Recovery =====

==== Backup Database ====

<code bash>
# Simple copy
cp backend/meal-planner.db backend/meal-planner.db.$(date +%Y%m%d_%H%M%S)

# With SQLite dump
sqlite3 backend/meal-planner.db .dump > backup.sql
</code>

==== Restore Database ====

<code bash>
# From backup file
cp backend/meal-planner.db.bak backend/meal-planner.db

# From SQL dump
sqlite3 backend/meal-planner.db < backup.sql
</code>

===== Quick Start Guide =====

**If your brain was wiped and you need to get this running:**

<code bash>
# 1. Navigate to project
cd /home/neil/meals

# 2. Ensure dependencies are installed
npm run install:all

# 3. Build backend and frontend
cd backend && npm run build && cd ..
cd frontend && npm run build && cd ..

# 4. Start with PM2
pm2 start ecosystem.config.cjs

# 5. Check status
pm2 status

# 6. View logs if needed
pm2 logs

# 7. Access application
# Frontend: http://localhost:3000 or http://meals.sporez.us
# Backend API: http://localhost:3001
</code>

===== Key Features =====

  * **Meal Management**: Add, edit, delete meals with categories
  * **Category System**: Organize meals by cuisine type with color coding
  * **Star Ratings**: Rate meals 1-5 stars
  * **Difficulty Levels**: Easy, Medium, Hard
  * **Leftovers Tracking**: Mark meals that produce leftovers
  * **Serving History**: Track when meals were last served and total times served
  * **Weekly Planning**: Plan meals for the entire week (Monday-Sunday)
  * **Smart Generation**: Auto-generate meal plans based on difficulty balance
  * **Saved Plans**: Save and load previous weekly meal plans
  * **Dark Mode**: UI supports dark theme
  * **Statistics Reset**: Reset serving counts and dates

===== Maintenance Tasks =====

==== Regular Maintenance ====

<code bash>
# Update dependencies (check for security updates)
npm outdated
npm update

# Clean old logs
rm backend/logs/*.log
rm frontend/logs/*.log

# Backup database weekly
cp backend/meal-planner.db backend/meal-planner.db.weekly.$(date +%Y%m%d)

# Restart PM2 processes monthly
pm2 restart ecosystem.config.cjs
</code>

==== Monitoring ====

<code bash>
# Monitor process health
pm2 monit

# Check disk space
df -h

# Check memory usage
free -h

# View PM2 process details
pm2 info meal-planner-backend
pm2 info meal-planner-frontend
</code>

===== Contact & Support =====

  * **Application**: Meal Planner
  * **Version**: 1.0.0
  * **Database**: SQLite (better-sqlite3)
  * **Process Manager**: PM2 6.0.13
  * **Production URL**: meals.sporez.us

---

//Last updated: 2025-11-08//
