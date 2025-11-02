import { useState, useEffect } from 'react';
import { MealPlan } from '../types';
import * as api from '../services/api';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface SavedPlansProps {
  onEdit?: (plan: MealPlan) => void;
}

export default function SavedPlans({ onEdit }: SavedPlansProps) {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setIsLoading(true);
    setError('');
    try {
      const fetchedPlans = await api.getMealPlans();
      setPlans(fetchedPlans);
    } catch (err: any) {
      setError(err.message || 'Failed to load saved plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meal plan?')) {
      return;
    }

    try {
      await api.deleteMealPlan(id);
      setPlans(plans.filter(p => p.id !== id));
      if (expandedPlanId === id) {
        setExpandedPlanId(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete meal plan');
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      medium: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      hard: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  };

  const formatWeekRange = (weekStartDate: string) => {
    // Parse in local time to avoid timezone issues
    const [year, month, day] = weekStartDate.split('-').map(Number);
    const start = new Date(year, month - 1, day);
    const end = new Date(year, month - 1, day);
    end.setDate(end.getDate() + 6);

    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Loading saved plans...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Saved Meal Plans</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          View and manage your saved weekly meal plans
        </p>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {plans.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-lg font-medium mb-2">No saved meal plans yet</p>
          <p className="text-sm">Generate and save a weekly plan to see it here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const isExpanded = expandedPlanId === plan.id;

            return (
              <div
                key={plan.id}
                className="border border-gray-200 dark:border-gray-700 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Plan Header */}
                <div
                  className="p-4 bg-gray-50 dark:bg-gray-700 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                >
                  <div>
                    <h3 className="font-semibold text-lg dark:text-white">
                      Week of {formatWeekRange(plan.weekStartDate)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Saved on {new Date(plan.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(plan);
                        }}
                        className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.print();
                      }}
                      className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                      title="Print this meal plan"
                    >
                      Print
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(plan.id);
                      }}
                      className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                    >
                      Delete
                    </button>
                    <svg
                      className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Expanded Plan Details */}
                {isExpanded && (
                  <div className="printable-meal-plan p-4 bg-white dark:bg-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
                      {DAYS_OF_WEEK.map((day, index) => {
                        const meal = plan.meals[index];
                        const prevMeal = index > 0 ? plan.meals[index - 1] : null;
                        const isLeftoverDay = prevMeal && meal && prevMeal.id === meal.id && meal.hasLeftovers;

                        return (
                          <div
                            key={day}
                            className="meal-day border border-gray-200 dark:border-gray-700 dark:bg-gray-700 rounded-lg p-3"
                          >
                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                              {day}
                            </div>

                            {meal && (
                              <div>
                                {isLeftoverDay && (
                                  <div className="text-xs text-purple-600 dark:text-purple-400 mb-1 flex items-center">
                                    <span className="mr-1">←</span>
                                    <span>Leftovers</span>
                                  </div>
                                )}

                                <div className="font-semibold text-sm mb-2 dark:text-white">{meal.name}</div>

                                <div className="flex flex-wrap gap-1">
                                  <span
                                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                                    style={{
                                      backgroundColor: meal.categoryColor + '20',
                                      color: meal.categoryColor,
                                    }}
                                  >
                                    {meal.categoryName}
                                  </span>

                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyBadge(
                                      meal.difficulty
                                    )}`}
                                  >
                                    {meal.difficulty}
                                  </span>

                                  {meal.hasLeftovers && !isLeftoverDay && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                                      Leftovers →
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
