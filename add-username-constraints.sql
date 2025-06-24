-- SQL script to add unique username constraints to the profiles table
-- Run this in the Supabase SQL editor

-- First, check for any duplicate usernames (case-insensitive)
SELECT LOWER(username) as username_lower, COUNT(*) as count
FROM profiles 
WHERE username IS NOT NULL 
GROUP BY LOWER(username) 
HAVING COUNT(*) > 1;

-- If there are duplicates, you may need to clean them up first
-- For now, let's proceed with adding the constraint

-- Add unique constraint on lowercase username
-- This ensures no two users can have the same username (case-insensitive)
ALTER TABLE profiles 
ADD CONSTRAINT unique_username_lowercase 
UNIQUE (LOWER(username));

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower 
ON profiles (LOWER(username));

-- Verify the constraint was added
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
AND conname = 'unique_username_lowercase';
