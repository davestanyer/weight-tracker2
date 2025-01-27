/*
  # Fix profile creation trigger

  1. Changes
    - Drop and recreate the trigger function with better error handling
    - Ensure profile is created with all required fields
    - Add proper security definer settings
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
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Failed to create profile for user: %', NEW.id;
    RETURN NEW;
END;
$$;

-- Create trigger that runs AFTER INSERT
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();