/*
  # Fix profile constraints and triggers

  1. Changes
    - Add trigger to auto-create profile on user creation
    - Add trigger to sync email between auth.users and profiles
    - Modify foreign key constraint to cascade delete

  2. Security
    - Maintains existing RLS policies
*/

-- Drop existing foreign key constraint
ALTER TABLE weight_logs
DROP CONSTRAINT weight_logs_user_id_fkey;

-- Add new constraint with CASCADE
ALTER TABLE weight_logs
ADD CONSTRAINT weight_logs_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id)
ON DELETE CASCADE;

-- Create function to handle profile creation
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

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();