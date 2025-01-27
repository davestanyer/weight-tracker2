/*
  # Fix profile creation and email handling
  
  1. Changes
    - Update trigger function to properly handle email
    - Add NOT NULL constraint with validation
    - Ensure default values are set correctly
  
  2. Security
    - Maintain data integrity with NOT NULL constraints
    - Ensure email is always set from auth.users
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Ensure email is not null before inserting
  IF NEW.email IS NULL THEN
    RAISE EXCEPTION 'Email cannot be null';
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    height,
    current_weight,
    target_weight,
    calorie_goal,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    175, -- Default height in cm
    70,  -- Default weight in kg
    70,  -- Default target weight same as current
    2000, -- Default daily calorie goal
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Create trigger that runs AFTER INSERT
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update any existing NULL emails (if any)
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
AND p.email IS NULL;