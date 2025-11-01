import { useState, useEffect } from 'react';
import AddMealForm from './components/AddMealForm';
import MealList from './components/MealList';
import WeeklyPlanner from './components/WeeklyPlanner';
import CategoryManager from './components/CategoryManager';
import EditMealModal from './components/EditMealModal';
import SavedPlans from './components/SavedPlans';
import { Category, MealWithCategory, CreateMealRequest, UpdateMealRequest } from './types';
import * as api from './services/api';

type Tab = 'plan' | 'meals' | 'categories' | 'saved';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('plan');
  const [categories, setCategories] = useState<Category[]>([]);
  const [meals, setMeals] = useState<MealWithCategory[]>([]);
  const [editingMeal, setEditingMeal] = useState<MealWithCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Meal Planner</h1>

          {/* Tabs */}
          <div className="mt-4 border-b border-gray-200 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max sm:min-w-0">
              <button
                onClick={() => setActiveTab('plan')}
                className={`${
                  activeTab === 'plan'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-2 sm:px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Plan Week
              </button>
              <button
                onClick={() => setActiveTab('meals')}
                className={`${
                  activeTab === 'meals'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-2 sm:px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                <span className="hidden sm:inline">Manage Meals ({meals.length})</span>
                <span className="sm:hidden">Meals ({meals.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`${
                  activeTab === 'categories'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-2 sm:px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Categories ({categories.length})
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`${
                  activeTab === 'saved'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          <WeeklyPlanner onPlanSaved={loadData} />
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
          <SavedPlans />
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
