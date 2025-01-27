import React from 'react';
import { Book, Plus, Pencil, Trash2 } from 'lucide-react';

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
  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Book className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700">Food Library</h3>
        </div>
        <button
          onClick={onAddFood}
          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500"
        >
          <Plus className="w-4 h-4" />
          Add Food
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {foods.map((food) => (
          <div
            key={food.id}
            className="p-2 rounded border border-gray-200 hover:border-indigo-500 transition-colors group"
          >
            <div className="flex justify-between items-start">
              <div
                onClick={() => onSelectFood(food)}
                className="flex-1 cursor-pointer"
              >
                <div className="font-medium text-sm">{food.name}</div>
                <div className="text-xs text-gray-500">
                  {food.calories} kcal / {food.portion}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEditFood(food)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Pencil className="w-3 h-3 text-gray-600" />
                </button>
                <button
                  onClick={() => onDeleteFood(food.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}