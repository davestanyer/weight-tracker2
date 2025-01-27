/*
  # Add calorie goal to profiles

  1. Changes
    - Add calorie_goal column to profiles table
    - Add check constraint to ensure positive values
    - Add default value of 2000 calories
*/

-- Add calorie_goal column with default value and constraint
ALTER TABLE profiles
ADD COLUMN calorie_goal integer DEFAULT 2000 CHECK (calorie_goal > 0);

-- Update existing profiles to have the default value
UPDATE profiles SET calorie_goal = 2000 WHERE calorie_goal IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE profiles
ALTER COLUMN calorie_goal SET NOT NULL;