import React from 'react';
import { Scale, Apple } from 'lucide-react';

interface QuickActionProps {
  onLogWeight: () => void;
  onLogMeal: () => void;
}

export function QuickActions({ onLogWeight, onLogMeal }: QuickActionProps) {
  return (
    <div className="flex flex-row space-x-4 justify-center">
      <button
        onClick={onLogWeight}
        className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
      >
        <Scale className="w-5 h-5 mr-2" />
        <span>Log Weight</span>
      </button>
      
      <button
        onClick={onLogMeal}
        className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
      >
        <Apple className="w-5 h-5 mr-2" />
        <span>Log Meal</span>
      </button>
    </div>
  );
}