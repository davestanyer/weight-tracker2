/*
  # Add policies for weight logs

  1. Changes
    - Add UPDATE policy for weight_logs table
    - Add DELETE policy for weight_logs table
    
  2. Security
    - Ensures users can only update and delete their own weight logs
    - Maintains row level security
*/

-- Add UPDATE and DELETE policies for weight_logs table
CREATE POLICY "Users can update own weight logs"
  ON weight_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight logs"
  ON weight_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);