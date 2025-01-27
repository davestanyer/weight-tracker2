/*
  # Add constraints and indexes

  1. Constraints
    - Add CHECK constraints for numeric fields
    - Add NOT NULL constraints where appropriate
  2. Indexes
    - Add indexes for frequently queried columns
    - Add composite indexes for common query patterns
*/

-- Add CHECK constraints
ALTER TABLE profiles
ADD CONSTRAINT height_positive CHECK (height > 0),
ADD CONSTRAINT current_weight_positive CHECK (current_weight > 0),
ADD CONSTRAINT target_weight_positive CHECK (target_weight > 0);

ALTER TABLE weight_logs
ADD CONSTRAINT weight_positive CHECK (weight > 0);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date 
ON weight_logs (user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_weight_logs_date 
ON weight_logs (date DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON profiles (email);