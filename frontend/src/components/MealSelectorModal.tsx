import { useState, useEffect } from 'react';
import { MealWithCategory } from '../types';

interface MealSelectorModalProps {
  meals: MealWithCategory[];
  onSelect: (meal: MealWithCategory) => void;
  onClose: () => void;
  dayName: string;
}

export default function MealSelectorModal({ meals, onSelect, onClose, dayName }: MealSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Get unique categories
  const categories = Array.from(new Set(meals.map(m => m.categoryName))).sort();

  // Filter meals
  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || meal.categoryName === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Select Meal for {dayName}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search meals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Meal List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredMeals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No meals found matching your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredMeals.map(meal => (
                <button
                  key={meal.id}
                  onClick={() => onSelect(meal)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="font-semibold text-lg mb-2">{meal.name}</div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: meal.categoryColor + '20',
                        color: meal.categoryColor,
                      }}
                    >
                      {meal.categoryName}
                    </span>

                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyBadge(meal.difficulty)}`}>
                      {meal.difficulty}
                    </span>

                    {meal.hasLeftovers && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Has Leftovers
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    Served {meal.timesServed}x
                    {meal.lastServedDate && (
                      <span className="ml-2">
                        Last: {new Date(meal.lastServedDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
