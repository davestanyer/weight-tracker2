/*
  # Create food library table

  1. New Tables
    - `food_library`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `calories` (integer)
      - `portion` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `food_library` table
    - Add policies for authenticated users to manage their own food items
*/

CREATE TABLE food_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  calories integer NOT NULL CHECK (calories > 0),
  portion text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE food_library ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own food library"
  ON food_library FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food items"
  ON food_library FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food items"
  ON food_library FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food items"
  ON food_library FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX idx_food_library_user_name ON food_library(user_id, name);