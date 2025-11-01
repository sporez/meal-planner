import { MealWithCategory } from '../types';

interface MealListProps {
  meals: MealWithCategory[];
  onEdit: (meal: MealWithCategory) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function MealList({ meals, onEdit, onDelete }: MealListProps) {
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

  if (meals.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Your Meals</h2>
        <p className="text-gray-500">No meals yet. Add your first meal above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Your Meals ({meals.length})</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meals.map((meal) => (
          <div
            key={meal.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg">{meal.name}</h3>
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

            <div className="text-sm text-gray-600 mb-3">
              <p>Served {meal.timesServed} times</p>
              {meal.lastServedDate && (
                <p>Last: {new Date(meal.lastServedDate).toLocaleDateString()}</p>
              )}
            </div>

            <button
              onClick={() => onEdit(meal)}
              className="w-full px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
