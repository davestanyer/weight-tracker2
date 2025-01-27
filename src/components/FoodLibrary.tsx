import React from 'react';
import { Book, Plus, Pencil, Trash2, Search } from 'lucide-react';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  portion: string;
}

interface FoodLibraryProps {
  foods: FoodItem[];
  onSelectFood: (food: FoodItem) => void;
  onEditFood: (food: FoodItem) => void;
  onDeleteFood: (id: string) => void;
  onAddFood: () => void;
}

export function FoodLibrary({ foods, onSelectFood, onEditFood, onDeleteFood, onAddFood }: FoodLibraryProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'name' | 'calories'>('name');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [selectedFoodForConfirmation, setSelectedFoodForConfirmation] = React.useState<FoodItem | null>(null);

  // Filter and sort foods
  const filteredAndSortedFoods = React.useMemo(() => {
    return [...foods]
      .filter(food => 
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.portion.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const modifier = sortOrder === 'asc' ? 1 : -1;
        if (sortBy === 'name') {
          return modifier * a.name.localeCompare(b.name);
        } else {
          return modifier * (a.calories - b.calories);
        }
      });
  }, [foods, searchTerm, sortBy, sortOrder]);

  const toggleSort = (field: 'name' | 'calories') => {
    if (sortBy === field) {
      setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFoodForConfirmation(food);
  };

  const handleConfirmation = (confirmed: boolean) => {
    if (confirmed && selectedFoodForConfirmation) {
      onSelectFood(selectedFoodForConfirmation);
    }
    setSelectedFoodForConfirmation(null);
  };

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Book className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-medium text-gray-900">Food Library</h3>
        </div>
        <button
          onClick={onAddFood}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Food
        </button>
      </div>

      {/* Search and Sort Controls */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search foods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => toggleSort('name')}
          className={`px-2 py-1 text-xs rounded ${
            sortBy === 'name' 
              ? 'bg-indigo-100 text-indigo-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => toggleSort('calories')}
          className={`px-2 py-1 text-xs rounded ${
            sortBy === 'calories' 
              ? 'bg-indigo-100 text-indigo-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Calories {sortBy === 'calories' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      {/* Food Items Grid */}
      {filteredAndSortedFoods.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No foods match your search' : 'No foods added yet'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredAndSortedFoods.map((food) => (
            <div
              key={food.id}
              className="p-3 rounded-lg border border-gray-200 hover:border-indigo-500 hover:shadow-sm transition-all duration-200 group bg-white"
            >
              <div className="flex justify-between items-start">
                <div
                  onClick={() => handleFoodSelect(food)}
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium text-gray-900">{food.name}</div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {food.calories.toLocaleString()} calories / {food.portion}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditFood(food)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                    title="Edit food"
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this food item?')) {
                        onDeleteFood(food.id);
                      }
                    }}
                    className="p-1 hover:bg-red-100 rounded-full"
                    title="Delete food"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      {selectedFoodForConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add to Daily Log?</h3>
            <p className="text-gray-600 mb-6">
              Would you like to add {selectedFoodForConfirmation.name} ({selectedFoodForConfirmation.calories} calories per {selectedFoodForConfirmation.portion}) to your daily log?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleConfirmation(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmation(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Add to Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
