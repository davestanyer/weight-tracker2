/*
  # Fix foreign key constraints and nullability

  1. Changes
    - Ensure profiles table has NOT NULL constraints where needed
    - Add CASCADE to foreign key relationships
    - Add proper indexes for performance
*/

-- Make email NOT NULL in profiles
ALTER TABLE profiles 
ALTER COLUMN email SET NOT NULL;

-- Ensure weight_logs foreign key is properly set
ALTER TABLE weight_logs
DROP CONSTRAINT IF EXISTS weight_logs_user_id_fkey,
ADD CONSTRAINT weight_logs_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Add composite index for faster queries
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date 
ON weight_logs(user_id, date DESC);

-- Ensure trigger function exists and works
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;