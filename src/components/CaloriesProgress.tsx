import React from 'react';
import { Target } from 'lucide-react';

interface CaloriesProgressProps {
  dailyGoal: number;
  currentCalories: number;
}

export function CaloriesProgress({ dailyGoal, currentCalories }: CaloriesProgressProps) {
  const percentage = Math.min((currentCalories / dailyGoal) * 100, 100);
  const remaining = Math.max(dailyGoal - currentCalories, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Daily Calories</h2>
        <Target className="w-6 h-6 text-gray-400" />
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium">{currentCalories} / {dailyGoal} calories</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Remaining</span>
        <span className="font-medium">{remaining} calories</span>
      </div>
    </div>
  );
}