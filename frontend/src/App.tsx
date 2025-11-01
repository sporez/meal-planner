import { useState, useEffect } from 'react';
import AddMealForm from './components/AddMealForm';
import MealList from './components/MealList';
import WeeklyPlanner from './components/WeeklyPlanner';
import CategoryManager from './components/CategoryManager';
import EditMealModal from './components/EditMealModal';
import SavedPlans from './components/SavedPlans';
import { Category, MealWithCategory, CreateMealRequest, UpdateMealRequest, MealPlan } from './types';
import * as api from './services/api';

type Tab = 'plan' | 'meals' | 'categories' | 'saved';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('plan');
  const [categories, setCategories] = useState<Category[]>([]);
  const [meals, setMeals] = useState<MealWithCategory[]>([]);
  const [editingMeal, setEditingMeal] = useState<MealWithCategory | null>(null);
  const [editingPlan, setEditingPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [categoriesData, mealsData] = await Promise.all([
        api.getCategories(),
        api.getMeals(),
      ]);
      setCategories(categoriesData);
      setMeals(mealsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async (mealData: CreateMealRequest) => {
    const newMeal = await api.createMeal(mealData);
    setMeals([...meals, newMeal]);
  };

  const handleUpdateMeal = async (id: string, updates: UpdateMealRequest) => {
    const updatedMeal = await api.updateMeal(id, updates);
    setMeals(meals.map((m) => (m.id === id ? updatedMeal : m)));
  };

  const handleDeleteMeal = async (id: string) => {
    await api.deleteMeal(id);
    setMeals(meals.filter((m) => m.id !== id));
  };

  const handleEditPlan = (plan: MealPlan) => {
    setEditingPlan(plan);
    setActiveTab('plan');
  };

  const handlePlanSaved = () => {
    setEditingPlan(null);
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meal Planner</h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max sm:min-w-0">
              <button
                onClick={() => setActiveTab('plan')}
                className={`${
                  activeTab === 'plan'
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap py-4 px-2 sm:px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Plan Week
              </button>
              <button
                onClick={() => setActiveTab('meals')}
                className={`${
                  activeTab === 'meals'
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap py-4 px-2 sm:px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                <span className="hidden sm:inline">Manage Meals ({meals.length})</span>
                <span className="sm:hidden">Meals ({meals.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`${
                  activeTab === 'categories'
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap py-4 px-2 sm:px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Categories ({categories.length})
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`${
                  activeTab === 'saved'
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap py-4 px-2 sm:px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                <span className="hidden sm:inline">Saved Plans</span>
                <span className="sm:hidden">Saved</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button
              onClick={loadData}
              className="ml-4 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Plan Week Tab */}
        {activeTab === 'plan' && (
          <WeeklyPlanner onPlanSaved={handlePlanSaved} editingPlan={editingPlan} />
        )}

        {/* Manage Meals Tab */}
        {activeTab === 'meals' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Meal Form - Left Column */}
            <div className="lg:col-span-1">
              <AddMealForm categories={categories} onSubmit={handleAddMeal} />
            </div>

            {/* Meal List - Right Columns */}
            <div className="lg:col-span-2">
              <MealList meals={meals} onEdit={setEditingMeal} onDelete={handleDeleteMeal} />
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <CategoryManager categories={categories} onUpdate={loadData} />
        )}

        {/* Saved Plans Tab */}
        {activeTab === 'saved' && (
          <SavedPlans onEdit={handleEditPlan} />
        )}
      </main>

      {/* Edit Meal Modal */}
      {editingMeal && (
        <EditMealModal
          meal={editingMeal}
          categories={categories}
          onSave={handleUpdateMeal}
          onClose={() => setEditingMeal(null)}
        />
      )}
    </div>
  );
}

export default App;
