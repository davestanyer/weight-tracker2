/*
  # Add missing policies for meals table

  1. Changes
    - Add UPDATE policy for meals table
    - Add DELETE policy for meals table
    
  2. Security
    - Ensures users can only update and delete their own meals
    - Maintains row level security
*/

-- Add UPDATE and DELETE policies for meals table
CREATE POLICY "Users can update own meals"
  ON meals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
  ON meals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);