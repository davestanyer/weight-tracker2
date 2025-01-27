export interface Profile {
  id: string;
  email: string;
  name: string | null;
  height: number | null;
  current_weight: number | null;
  target_weight: number | null;
  target_date: string | null;
  calorie_goal: number;
  created_at: string;
  updated_at: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  weight: number;
  date: string;
  note: string;
  created_at: string;
}

export interface Exercise {
  id: string;
  user_id: string;
  type: string;
  duration: number;
  calories_burned: number | null;
  date: string;
  note: string | null;
  created_at: string;
}

export interface Meal {
  id: string;
  user_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  calories: number;
  date: string;
  created_at: string;
}

export interface FoodItem {
  id: string;
  user_id: string;
  name: string;
  calories: number;
  portion: string;
  created_at: string;
}