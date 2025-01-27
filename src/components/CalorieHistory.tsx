import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DailyCalories {
  date: string;
  total: number;
}

interface CalorieHistoryProps {
  dailyCalories: DailyCalories[];
  dailyGoal: number;
  onDateSelect: (date: string) => void;
  selectedDate: string;
}

export function CalorieHistory({ dailyCalories, dailyGoal, onDateSelect, selectedDate }: CalorieHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NZ', {
      timeZone: 'Pacific/Auckland',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Find the index of the selected date
  const selectedIndex = dailyCalories.findIndex(d => d.date === selectedDate);

  // Calculate start index to ensure selected date is visible
  const [startIndex, setStartIndex] = useState(() => {
    if (selectedIndex === -1) return 0;
    return Math.max(0, Math.min(selectedIndex, dailyCalories.length - 7));
  });

  const displayDays = 7;

  // Get the visible days
  const visibleDays = dailyCalories.slice(startIndex, startIndex + displayDays);

  // Find the maximum calorie value for scaling (minimum 1000 to avoid division by zero)
  const maxCalories = Math.max(
    1000,
    dailyGoal,
    ...visibleDays.map(day => day.total)
  );

  // Navigation controls
  const canGoBack = startIndex > 0;
  const canGoForward = startIndex + displayDays < dailyCalories.length;

  const handlePrevious = () => {
    if (canGoBack) {
      const newIndex = Math.max(0, startIndex - displayDays);
      setStartIndex(newIndex);
      // Select the last day in the new view
      onDateSelect(dailyCalories[newIndex + displayDays - 1].date);
    }
  };

  const handleNext = () => {
    if (canGoForward) {
      const newIndex = Math.min(dailyCalories.length - displayDays, startIndex + displayDays);
      setStartIndex(newIndex);
      // Select the first day in the new view
      onDateSelect(dailyCalories[newIndex].date);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Calorie History</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrevious}
            className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            disabled={!canGoBack}
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={handleNext}
            className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            disabled={!canGoForward}
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between text-xs text-gray-500">
          <span>{maxCalories}</span>
          <span>{Math.round(maxCalories * 0.75)}</span>
          <span>{Math.round(maxCalories * 0.5)}</span>
          <span>{Math.round(maxCalories * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Graph area */}
        <div className="absolute left-16 right-0 top-0 bottom-8">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 0.25, 0.5, 0.75, 1].map((position) => (
              <div
                key={position}
                className="w-full border-t border-gray-200"
                style={{ top: `${position * 100}%` }}
              />
            ))}
          </div>

          {/* Target line */}
          <div 
            className="absolute w-full border-t-2 border-dashed border-indigo-300"
            style={{ 
              top: `${(1 - dailyGoal / maxCalories) * 100}%`,
              zIndex: 1 
            }}
          />

          {/* Bars */}
          <div className="absolute inset-0 flex justify-between items-end">
            {visibleDays.map((day) => {
              const percentage = Math.max(1, (day.total / maxCalories) * 100);
              const isSelected = day.date === selectedDate;
              const isOverGoal = day.total > dailyGoal;
              
              return (
                <div
                  key={day.date}
                  className="relative flex flex-col items-center group"
                  style={{ width: `${100 / displayDays}%` }}
                >
                  {/* Bar */}
                  <button
                    onClick={() => onDateSelect(day.date)}
                    className="w-full px-2 group-hover:opacity-100 transition-opacity"
                    style={{ height: '100%' }}
                  >
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        isOverGoal ? 'bg-red-500' : 'bg-indigo-500'
                      } ${isSelected ? 'opacity-100' : 'opacity-60'}`}
                      style={{ 
                        height: `${percentage}%`,
                        minHeight: '2px' // Ensure bar is always visible
                      }}
                    />
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10">
                      {day.total} calories
                    </div>
                  </button>

                  {/* Date label */}
                  <div className={`text-xs mt-2 ${
                    isSelected ? 'font-medium text-indigo-600' : 'text-gray-600'
                  }`}>
                    {formatDate(day.date)}
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-between text-xs text-gray-500 mt-4 pt-4 border-t">
        <span>Daily Goal: {dailyGoal} calories</span>
        <div className="flex gap-4">
          <span className="flex items-center">
            <div className="w-3 h-3 bg-indigo-500 rounded-full mr-1" /> Under Goal
          </span>
          <span className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-1" /> Over Goal
          </span>
        </div>
      </div>
    </div>
  );
}