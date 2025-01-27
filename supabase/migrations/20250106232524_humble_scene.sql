/*
  # Add Exercise and Meal Tracking Tables

  1. New Tables
    - exercises: Track workout sessions
    - meals: Track food intake
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create exercises table
CREATE TABLE exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  duration integer NOT NULL,
  calories_burned integer,
  date date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Create meals table
CREATE TABLE meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  description text NOT NULL,
  calories integer,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Policies for exercises
CREATE POLICY "Users can view own exercises"
  ON exercises FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercises"
  ON exercises FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for meals
CREATE POLICY "Users can view own meals"
  ON meals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
  ON meals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add indexes
CREATE INDEX idx_exercises_user_date ON exercises(user_id, date DESC);
CREATE INDEX idx_meals_user_date ON meals(user_id, date DESC);