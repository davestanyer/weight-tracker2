/*
  # Add default values and NOT NULL constraints
  
  1. Changes
    - Add NOT NULL constraints with defaults for important columns
    - Add CHECK constraints to ensure valid values
    - Update existing NULL values to defaults
  
  2. Security
    - Maintain data integrity with constraints
    - Prevent NULL values in critical columns
*/

-- Update meals table
ALTER TABLE meals
ALTER COLUMN calories SET DEFAULT 0,
ALTER COLUMN calories SET NOT NULL;

-- Update existing NULL calories to 0
UPDATE meals SET calories = 0 WHERE calories IS NULL;

-- Add CHECK constraints for meals
ALTER TABLE meals
ADD CONSTRAINT calories_non_negative CHECK (calories >= 0);

-- Update weight_logs table
ALTER TABLE weight_logs
ALTER COLUMN note SET DEFAULT '',
ALTER COLUMN note SET NOT NULL;

-- Update existing NULL notes to empty string
UPDATE weight_logs SET note = '' WHERE note IS NULL;

-- Update food_library table
ALTER TABLE food_library
ALTER COLUMN portion SET DEFAULT 'serving',
ALTER COLUMN portion SET NOT NULL;