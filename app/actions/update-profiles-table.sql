-- Add new columns to the profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS music_interests TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Update the updated_at column for existing records
UPDATE profiles
SET updated_at = created_at
WHERE updated_at IS NULL;
