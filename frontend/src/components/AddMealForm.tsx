import { useState, FormEvent } from 'react';
import { Category, Difficulty, CreateMealRequest } from '../types';

interface AddMealFormProps {
  categories: Category[];
  onSubmit: (meal: CreateMealRequest) => Promise<void>;
}

export default function AddMealForm({ categories, onSubmit }: AddMealFormProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [hasLeftovers, setHasLeftovers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !categoryId) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({ name: name.trim(), categoryId, difficulty, hasLeftovers });
      // Reset form
      setName('');
      setCategoryId('');
      setDifficulty('medium');
      setHasLeftovers(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add meal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Add New Meal</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Meal Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Chicken Stir Fry"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Difficulty
          </label>
          <div className="flex gap-4">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
              <label key={diff} className="flex items-center dark:text-gray-300">
                <input
                  type="radio"
                  name="difficulty"
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
            id="hasLeftovers"
            checked={hasLeftovers}
            onChange={(e) => setHasLeftovers(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={isSubmitting}
          />
          <label htmlFor="hasLeftovers" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Has leftovers (will be scheduled for 2 consecutive days)
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Adding...' : 'Add Meal'}
        </button>
      </form>
    </div>
  );
}
