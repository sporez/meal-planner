import { useState, useMemo } from 'react';
import { MealWithCategory } from '../types';

interface MealListProps {
  meals: MealWithCategory[];
  onEdit: (meal: MealWithCategory) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function MealList({ meals, onEdit, onDelete }: MealListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await onDelete(id);
      } catch (err) {
        alert('Failed to delete meal');
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get unique categories and difficulties for filters
  const categories = useMemo(() =>
    Array.from(new Set(meals.map(m => m.categoryName))).sort(),
    [meals]
  );

  const difficulties = ['easy', 'medium', 'hard'];

  // Filter meals based on search and filters
  const filteredMeals = useMemo(() => {
    return meals.filter(meal => {
      const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || meal.categoryName === selectedCategory;
      const matchesDifficulty = !selectedDifficulty || meal.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [meals, searchTerm, selectedCategory, selectedDifficulty]);

  if (meals.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Your Meals</h2>
        <p className="text-gray-500 dark:text-gray-400">No meals yet. Add your first meal above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Your Meals ({meals.length})</h2>

      {/* Search and Filters */}
      <div className="mb-4 space-y-3">
        <input
          type="text"
          placeholder="Search meals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Difficulties</option>
            {difficulties.map(diff => (
              <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
            ))}
          </select>
        </div>
        {filteredMeals.length < meals.length && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredMeals.length} of {meals.length} meals
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMeals.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
            No meals match your filters
          </div>
        ) : (
          filteredMeals.map((meal) => (
          <div
            key={meal.id}
            className="border border-gray-200 dark:border-gray-700 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg dark:text-white">{meal.name}</h3>
              <button
                onClick={() => handleDelete(meal.id, meal.name)}
                className="text-red-500 hover:text-red-700 text-xl"
                title="Delete meal"
              >
                ×
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: meal.categoryColor + '20',
                  color: meal.categoryColor,
                }}
              >
                {meal.categoryName}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                  meal.difficulty
                )}`}
              >
                {meal.difficulty}
              </span>

              {meal.hasLeftovers && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Has Leftovers
                </span>
              )}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              <p>Served {meal.timesServed} times</p>
              {meal.lastServedDate && (
                <p>Last: {new Date(meal.lastServedDate).toLocaleDateString()}</p>
              )}
            </div>

            <button
              onClick={() => onEdit(meal)}
              className="w-full px-3 py-1 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              Edit
            </button>
          </div>
          ))
        )}
      </div>
    </div>
  );
}
