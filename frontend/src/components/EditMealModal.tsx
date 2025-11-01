import { useState, FormEvent, useEffect } from 'react';
import { Category, Difficulty, MealWithCategory, UpdateMealRequest } from '../types';

interface EditMealModalProps {
  meal: MealWithCategory;
  categories: Category[];
  onSave: (id: string, updates: UpdateMealRequest) => Promise<void>;
  onClose: () => void;
}

export default function EditMealModal({ meal, categories, onSave, onClose }: EditMealModalProps) {
  const [name, setName] = useState(meal.name);
  const [categoryId, setCategoryId] = useState(meal.categoryId);
  const [difficulty, setDifficulty] = useState<Difficulty>(meal.difficulty);
  const [hasLeftovers, setHasLeftovers] = useState(meal.hasLeftovers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Meal name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(meal.id, {
        name: name.trim(),
        categoryId,
        difficulty,
        hasLeftovers,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update meal');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Edit Meal</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                Meal Name
              </label>
              <input
                type="text"
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="edit-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <div className="flex gap-4">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                  <label key={diff} className="flex items-center">
                    <input
                      type="radio"
                      name="edit-difficulty"
                      value={diff}
                      checked={difficulty === diff}
                      onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                      className="mr-2"
                      disabled={isSubmitting}
                    />
                    <span className="capitalize">{diff}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="edit-hasLeftovers"
                checked={hasLeftovers}
                onChange={(e) => setHasLeftovers(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isSubmitting}
              />
              <label htmlFor="edit-hasLeftovers" className="ml-2 block text-sm text-gray-700">
                Has leftovers (will be scheduled for 2 consecutive days)
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
