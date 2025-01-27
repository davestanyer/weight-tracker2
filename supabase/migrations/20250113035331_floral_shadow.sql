-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle profile creation with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  _email text;
BEGIN
  -- Get email from auth.users
  SELECT email INTO _email FROM auth.users WHERE id = NEW.id;
  
  -- Validate email
  IF _email IS NULL THEN
    RAISE EXCEPTION 'Email cannot be null';
  END IF;

  -- Insert profile with validated email
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
    _email,
    175, -- Default height in cm
    70,  -- Default weight in kg
    70,  -- Default target weight same as current
    2000, -- Default daily calorie goal
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = NOW()
  WHERE profiles.email IS NULL OR profiles.email = '';
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't prevent user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger that runs AFTER INSERT
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update any existing profiles with missing emails
DO $$
BEGIN
  UPDATE profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.id = u.id
  AND (p.email IS NULL OR p.email = '');
END $$;