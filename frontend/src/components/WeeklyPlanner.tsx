import { useState } from 'react';
import { MealPlan, MealWithCategory } from '../types';
import * as api from '../services/api';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface WeeklyPlannerProps {
  onPlanSaved?: () => void;
}

export default function WeeklyPlanner({ onPlanSaved }: WeeklyPlannerProps) {
  const [weekStartDate, setWeekStartDate] = useState<string>(getNextMonday());
  const [generatedPlan, setGeneratedPlan] = useState<MealPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGenerate = async () => {
    setError('');
    setSuccess('');
    setIsGenerating(true);

    try {
      const plan = await api.generateMealPlan(weekStartDate);
      setGeneratedPlan(plan);
    } catch (err: any) {
      setError(err.message || 'Failed to generate meal plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedPlan) return;

    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const mealIds = generatedPlan.meals.map(m => m.id);
      await api.saveMealPlan(weekStartDate, mealIds);
      setSuccess('Meal plan saved successfully!');
      setGeneratedPlan(null);
      onPlanSaved?.();
    } catch (err: any) {
      setError(err.message || 'Failed to save meal plan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = () => {
    setGeneratedPlan(null);
    handleGenerate();
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateStr: string, dayOffset: number) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + dayOffset);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Weekly Meal Planner</h2>

        {/* Week Selector */}
        <div className="flex items-center gap-4 mb-4">
          <label htmlFor="week-start" className="text-sm font-medium text-gray-700">
            Week Starting (Monday):
          </label>
          <input
            type="date"
            id="week-start"
            value={weekStartDate}
            onChange={(e) => setWeekStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleGenerate}
            disabled={isGenerating || isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate Week'}
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
      </div>

      {/* Generated Meal Plan */}
      {generatedPlan && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Generated Meal Plan</h3>
            <div className="flex gap-2">
              <button
                onClick={handleRegenerate}
                disabled={isGenerating || isSaving}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 transition-colors"
              >
                Regenerate
              </button>
              <button
                onClick={handleSave}
                disabled={isGenerating || isSaving}
                className="px-4 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300 transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Plan'}
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
            {DAYS_OF_WEEK.map((day, index) => {
              const meal = generatedPlan.meals[index];
              const prevMeal = index > 0 ? generatedPlan.meals[index - 1] : null;
              const isLeftoverDay = prevMeal && meal && prevMeal.id === meal.id && meal.hasLeftovers;

              return (
                <div
                  key={day}
                  className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    {day}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {formatDate(weekStartDate, index)}
                  </div>

                  {meal && (
                    <div>
                      {isLeftoverDay && (
                        <div className="text-xs text-purple-600 mb-1 flex items-center">
                          <span className="mr-1">←</span>
                          <span>Leftovers</span>
                        </div>
                      )}

                      <div className="font-semibold text-sm mb-2">{meal.name}</div>

                      <div className="flex flex-wrap gap-1 mb-2">
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
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Leftovers →
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-gray-500">
                        Served {meal.timesServed}x
                        {meal.lastServedDate && (
                          <span className="block">
                            Last: {new Date(meal.lastServedDate).toLocaleDateString()}
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

      {/* Empty State */}
      {!generatedPlan && (
        <div className="text-center py-12 text-gray-500">
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-lg font-medium mb-2">No meal plan generated yet</p>
          <p className="text-sm">Select a week and click "Generate Week" to create an intelligent meal plan</p>
        </div>
      )}
    </div>
  );
}

/**
 * Get the next Monday's date in YYYY-MM-DD format
 */
function getNextMonday(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;

  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);

  return nextMonday.toISOString().split('T')[0];
}
