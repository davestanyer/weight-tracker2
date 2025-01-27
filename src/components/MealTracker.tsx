import React, { useState, useEffect } from 'react';
import { CaloriesProgress } from './CaloriesProgress';
import { FoodLibrary, type FoodItem } from './FoodLibrary';
import { CalorieChart } from './CalorieChart';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Pencil, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { LogModal } from './LogModal';

interface MealTrackerProps {
  onMealAdded: () => void;
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export function MealTracker({ onMealAdded, selectedDate, onDateSelect }: MealTrackerProps) {
  const { user } = useAuth();
  const [meals, setMeals] = useState<any[]>([]);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [currentCalories, setCurrentCalories] = useState(0);
  const [editingMeal, setEditingMeal] = useState<any | null>(null);
  const [isEditMealModalOpen, setIsEditMealModalOpen] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isFoodLibraryModalOpen, setIsFoodLibraryModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [weekMeals, setWeekMeals] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadTodaysMeals();
      loadCustomFoods();
      loadWeekMeals();
      loadUserProfile();
    }
  }, [user, selectedDate]);

  const loadUserProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('calorie_goal')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error loading profile:', error);
      return;
    }

    if (data) {
      setDailyGoal(data.calorie_goal);
    }
  };

  const loadTodaysMeals = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', selectedDate)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading meals:', error);
      return;
    }

    setMeals(data || []);
    const totalCalories = data?.reduce((sum, meal) => sum + (meal.calories || 0), 0) || 0;
    setCurrentCalories(totalCalories);
  };

  const loadWeekMeals = async () => {
    if (!user) return;

    // Calculate date range
    const endDate = new Date(selectedDate);
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - 6);

    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Error loading week meals:', error);
      return;
    }

    setWeekMeals(data || []);
  };

  const loadCustomFoods = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('food_library')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (error) {
      console.error('Error loading custom foods:', error);
      return;
    }

    setCustomFoods(data || []);
  };

  const handleEditMeal = async (data: any) => {
    if (!user || !editingMeal) return;

    const { error } = await supabase
      .from('meals')
      .update({
        meal_type: data.mealType,
        description: data.description,
        calories: parseInt(data.calories) || 0,
        date: selectedDate
      })
      .eq('id', editingMeal.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating meal:', error);
      return;
    }

    setIsEditMealModalOpen(false);
    setEditingMeal(null);
    await Promise.all([loadTodaysMeals(), loadWeekMeals()]);
  };

  const handleDeleteMeal = async (id: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this meal?')) return;

    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting meal:', error);
      return;
    }

    await Promise.all([loadTodaysMeals(), loadWeekMeals()]);
  };

  const handleLogMeal = async (data: any) => {
    if (!user) return;

    const mealData = {
      user_id: user.id,
      meal_type: data.mealType,
      description: selectedFood ? `${selectedFood.name} (${selectedFood.portion})` : data.description,
      calories: selectedFood ? selectedFood.calories : (parseInt(data.calories) || 0),
      date: selectedDate
    };

    const { error } = await supabase
      .from('meals')
      .insert([mealData]);

    if (error) {
      console.error('Error inserting meal:', error);
      return;
    }

    setIsMealModalOpen(false);
    setSelectedFood(null);
    await Promise.all([loadTodaysMeals(), loadWeekMeals()]);
    onMealAdded();
  };

  const handleSaveFood = async (data: any) => {
    if (!user) return;

    const foodData = {
      user_id: user.id,
      name: data.name,
      calories: parseInt(data.calories) || 0,
      portion: data.portion,
    };

    if (editingFood) {
      const { error } = await supabase
        .from('food_library')
        .update(foodData)
        .eq('id', editingFood.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating food:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('food_library')
        .insert([foodData]);

      if (error) {
        console.error('Error adding food:', error);
        return;
      }
    }

    setIsFoodLibraryModalOpen(false);
    setEditingFood(null);
    await loadCustomFoods();
  };

  const handleDeleteFood = async (id: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this food item?')) return;

    const { error } = await supabase
      .from('food_library')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting food:', error);
      return;
    }

    await loadCustomFoods();
  };

  const handlePreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    onDateSelect(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    const today = new Date().toISOString().split('T')[0];
    if (date.toISOString().split('T')[0] <= today) {
      onDateSelect(date.toISOString().split('T')[0]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div>
      <CaloriesProgress
        dailyGoal={dailyGoal}
        currentCalories={currentCalories}
      />
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {isToday ? "Today's Meals" : `Meals for ${formatDate(selectedDate)}`}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousDay}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateSelect(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="p-2 border rounded-md text-sm"
            />
            <button
              onClick={handleNextDay}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isToday}
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {meals.length === 0 ? (
            <p className="text-gray-500 text-sm">No meals logged for this date</p>
          ) : (
            meals.map((meal) => (
              <div key={meal.id} className="flex justify-between items-start border-b pb-3">
                <div>
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-indigo-100 text-indigo-800 mb-1">
                    {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
                  </span>
                  <p className="text-sm">{meal.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{meal.calories} calories</span>
                  <button
                    onClick={() => {
                      setEditingMeal(meal);
                      setIsEditMealModalOpen(true);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteMeal(meal.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <FoodLibrary
          foods={customFoods}
          onSelectFood={(food) => {
            setSelectedFood(food);
            handleLogMeal({
              mealType: 'snack',
              description: `${food.name} (${food.portion})`,
              calories: food.calories,
              date: selectedDate
            });
          }}
          onEditFood={(food) => {
            setEditingFood(food);
            setIsFoodLibraryModalOpen(true);
          }}
          onDeleteFood={handleDeleteFood}
          onAddFood={() => {
            setEditingFood(null);
            setIsFoodLibraryModalOpen(true);
          }}
        />
      </div>

      <CalorieChart
        selectedDate={selectedDate}
        meals={weekMeals}
        dailyGoal={dailyGoal}
      />

      <LogModal
        isOpen={isEditMealModalOpen}
        onClose={() => {
          setIsEditMealModalOpen(false);
          setEditingMeal(null);
        }}
        onSubmit={handleEditMeal}
        title="Edit Meal"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Meal Type</label>
            <select
              name="mealType"
              defaultValue={editingMeal?.meal_type}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              defaultValue={editingMeal?.description}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Calories</label>
            <input
              type="number"
              name="calories"
              defaultValue={editingMeal?.calories}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </LogModal>

      <LogModal
        isOpen={isFoodLibraryModalOpen}
        onClose={() => {
          setIsFoodLibraryModalOpen(false);
          setEditingFood(null);
        }}
        onSubmit={handleSaveFood}
        title={editingFood ? "Edit Food Item" : "Add Food Item"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              defaultValue={editingFood?.name}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Calories</label>
            <input
              type="number"
              name="calories"
              defaultValue={editingFood?.calories}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Portion</label>
            <input
              type="text"
              name="portion"
              defaultValue={editingFood?.portion}
              required
              placeholder="e.g., 1 cup, 100g"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </LogModal>
    </div>
  );
}