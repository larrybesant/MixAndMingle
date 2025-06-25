-- EMERGENCY SUPABASE USER CLEANUP
-- Run this in Supabase SQL Editor to force delete ALL users
-- This will completely wipe the user database for beta testing

-- Step 1: Disable RLS temporarily to allow deletions
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Delete all profiles first (this removes the foreign key references)
DELETE FROM profiles;

-- Step 3: Delete all users from auth.users (this is the main auth table)
DELETE FROM auth.users;

-- Step 4: Delete any remaining auth-related data
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.sessions;
DELETE FROM auth.audit_log_entries;

-- Step 5: Reset any sequences to start fresh
ALTER SEQUENCE auth.refresh_tokens_id_seq RESTART WITH 1;
ALTER SEQUENCE auth.audit_log_entries_instance_id_seq RESTART WITH 1;

-- Step 6: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 7: Verify cleanup
SELECT 
  'auth.users' as table_name, 
  COUNT(*) as remaining_records 
FROM auth.users
UNION ALL
SELECT 
  'profiles' as table_name, 
  COUNT(*) as remaining_records 
FROM profiles
UNION ALL
SELECT 
  'auth.sessions' as table_name, 
  COUNT(*) as remaining_records 
FROM auth.sessions
UNION ALL
SELECT 
  'auth.refresh_tokens' as table_name, 
  COUNT(*) as remaining_records 
FROM auth.refresh_tokens;

-- Expected result: All counts should be 0
