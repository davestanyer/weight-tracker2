/*
  # Fix datetime format handling

  1. Changes
    - Add trigger to ensure proper timestamp format for created_at
    - Add function to handle timestamp conversion
    - Update existing records to use proper timestamp format

  2. Security
    - No changes to RLS policies
*/

-- Create function to handle timestamp conversion
CREATE OR REPLACE FUNCTION handle_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure created_at is always a valid timestamp
  NEW.created_at := COALESCE(NEW.created_at, now());
  
  -- If created_at is not a valid timestamp, set it to now()
  IF NEW.created_at IS NULL OR NEW.created_at::text = '' THEN
    NEW.created_at := now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for weight_logs and meals
CREATE TRIGGER ensure_weight_logs_timestamp
  BEFORE INSERT OR UPDATE ON weight_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_timestamp();

CREATE TRIGGER ensure_meals_timestamp
  BEFORE INSERT OR UPDATE ON meals
  FOR EACH ROW
  EXECUTE FUNCTION handle_timestamp();

-- Update existing records to ensure valid timestamps
UPDATE weight_logs
SET created_at = COALESCE(created_at, now())
WHERE created_at IS NULL OR created_at::text = '';

UPDATE meals
SET created_at = COALESCE(created_at, now())
WHERE created_at IS NULL OR created_at::text = '';