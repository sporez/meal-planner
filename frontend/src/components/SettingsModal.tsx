import { useState, FormEvent, useEffect } from 'react';

interface AlgorithmSettings {
  avoidSameMealDays: number;
  maxCategoryPerWeek: number;
}

interface SettingsModalProps {
  onClose: () => void;
}

const DEFAULT_SETTINGS: AlgorithmSettings = {
  avoidSameMealDays: 10,
  maxCategoryPerWeek: 2,
};

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<AlgorithmSettings>(() => {
    const saved = localStorage.getItem('algorithmSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem('algorithmSettings', JSON.stringify(settings));
    onClose();
  };

  const handleReset = () => {
    if (window.confirm('Reset to default settings?')) {
      setSettings(DEFAULT_SETTINGS);
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Algorithm Settings</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="avoidSameMealDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Avoid Same Meal Days
              </label>
              <input
                type="number"
                id="avoidSameMealDays"
                min="0"
                max="365"
                value={settings.avoidSameMealDays}
                onChange={(e) => setSettings({ ...settings, avoidSameMealDays: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Minimum days between serving the same meal (default: 10)
              </p>
            </div>

            <div>
              <label htmlFor="maxCategoryPerWeek" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Category Per Week
              </label>
              <input
                type="number"
                id="maxCategoryPerWeek"
                min="1"
                max="7"
                value={settings.maxCategoryPerWeek}
                onChange={(e) => setSettings({ ...settings, maxCategoryPerWeek: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Maximum times the same category can appear in one week (default: 2)
              </p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-semibold mb-2 dark:text-white">How the Algorithm Works</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc list-inside">
                <li><strong>Recency:</strong> Meals not served recently score higher</li>
                <li><strong>Frequency:</strong> Less frequently served meals preferred</li>
                <li><strong>Category Diversity:</strong> Avoids repeating categories</li>
                <li><strong>Difficulty Balance:</strong> Targets ~2 easy, ~3 medium, ~2 hard per week</li>
                <li><strong>Rating:</strong> 1-5 star ratings multiply the final score (unrated = 3x)</li>
              </ul>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
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

export { type AlgorithmSettings, DEFAULT_SETTINGS };
