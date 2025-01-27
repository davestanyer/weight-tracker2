import React from 'react';
import { BarChart3 } from 'lucide-react';

interface CalorieChartProps {
  selectedDate: string;
  meals: any[];
  dailyGoal: number;
}

export function CalorieChart({ selectedDate, meals, dailyGoal }: CalorieChartProps) {
  // Get the last 7 days including the selected date
  const getLast7Days = () => {
    const days = [];
    const selected = new Date(selectedDate);
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(selected);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    
    return days;
  };

  const last7Days = getLast7Days();
  
  // Calculate daily totals
  const dailyTotals = last7Days.map(date => {
    const dayMeals = meals.filter(meal => meal.date === date);
    const total = dayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    return {
      date,
      total,
      isSelected: date === selectedDate,
      meals: dayMeals
    };
  });

  // Find the maximum value for scaling (minimum 1000 to avoid division by zero)
  const maxCalories = Math.max(1000, dailyGoal * 1.2, ...dailyTotals.map(day => day.total));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-semibold">Weekly Calorie Overview</h2>
        </div>
      </div>

      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between text-xs text-gray-500">
          <span>{maxCalories.toLocaleString()}</span>
          <span>{Math.round(maxCalories * 0.75).toLocaleString()}</span>
          <span>{Math.round(maxCalories * 0.5).toLocaleString()}</span>
          <span>{Math.round(maxCalories * 0.25).toLocaleString()}</span>
          <span>0</span>
        </div>

        {/* Graph area */}
        <div className="absolute left-16 right-0 top-0 bottom-8">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 0.25, 0.5, 0.75, 1].map((position) => (
              <div
                key={position}
                className="w-full border-t border-gray-100"
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
          >
            <div className="absolute right-0 transform translate-x-full ml-2 -mt-2.5">
              <span className="text-xs text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">
                Goal
              </span>
            </div>
          </div>

          {/* Columns */}
          <div className="absolute inset-0 flex justify-between items-end">
            {dailyTotals.map((day) => {
              const percentage = (day.total / maxCalories) * 100;
              const isOverGoal = day.total > dailyGoal;
              
              return (
                <div
                  key={day.date}
                  className="relative flex flex-col items-center group"
                  style={{ width: `${100 / 7}%` }}
                >
                  {/* Column */}
                  <div className="w-full px-1.5">
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        isOverGoal ? 'bg-red-500' : 'bg-indigo-500'
                      } ${day.isSelected ? 'opacity-100' : 'opacity-60'} hover:opacity-100`}
                      style={{ 
                        height: `${percentage}%`,
                        minHeight: '2px' // Ensure column is always visible
                      }}
                    >
                      {/* Value label on top of column */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                        {day.total.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Date label */}
                  <div className={`text-xs mt-2 font-medium ${
                    day.isSelected ? 'text-indigo-600' : 'text-gray-600'
                  }`}>
                    {formatDate(day.date)}
                  </div>

                  {/* Selection indicator */}
                  {day.isSelected && (
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1" />
                  )}

                  {/* Detailed tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap z-10">
                    <div className="font-medium mb-1">{formatDate(day.date)}</div>
                    <div className="space-y-1">
                      <div>Total: {day.total.toLocaleString()} calories</div>
                      <div className={day.total >= dailyGoal ? 'text-red-300' : 'text-green-300'}>
                        {day.total >= dailyGoal 
                          ? `${(day.total - dailyGoal).toLocaleString()} over goal`
                          : `${(dailyGoal - day.total).toLocaleString()} under goal`
                        }
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-between text-xs text-gray-600 mt-8 pt-4 border-t">
        <span className="font-medium">Daily Goal: {dailyGoal.toLocaleString()} calories</span>
        <div className="flex gap-4">
          <span className="flex items-center">
            <div className="w-3 h-3 bg-indigo-500 rounded mr-1" /> Under Goal
          </span>
          <span className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-1" /> Over Goal
          </span>
        </div>
      </div>
    </div>
  );
}