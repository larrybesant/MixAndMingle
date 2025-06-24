-- NUCLEAR SUPABASE CLEANUP - DELETE ALL USERS
-- This will completely wipe all user data for a fresh start
-- Run this in Supabase SQL Editor

-- Step 1: Disable all RLS policies temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Delete all data in the correct order (avoid foreign key conflicts)
-- Delete sessions first
DELETE FROM auth.sessions;

-- Delete refresh tokens
DELETE FROM auth.refresh_tokens;

-- Delete audit log entries  
DELETE FROM auth.audit_log_entries;

-- Delete all users from auth.users (main auth table)
DELETE FROM auth.users;

-- Delete profiles (this should cascade or be independent)
DELETE FROM profiles;

-- Step 3: Reset any auto-increment sequences
-- Reset refresh token sequence
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'refresh_tokens_id_seq' AND sequence_schema = 'auth') THEN
        PERFORM setval('auth.refresh_tokens_id_seq', 1, false);
    END IF;
END $$;

-- Reset audit log sequence
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'audit_log_entries_instance_id_seq' AND sequence_schema = 'auth') THEN
        PERFORM setval('auth.audit_log_entries_instance_id_seq', 1, false);
    END IF;
END $$;

-- Step 4: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Verify complete cleanup
SELECT 
    'auth.users' as table_name, 
    COUNT(*) as record_count,
    'SHOULD BE 0' as expected
FROM auth.users
UNION ALL
SELECT 
    'profiles' as table_name, 
    COUNT(*) as record_count,
    'SHOULD BE 0' as expected  
FROM profiles
UNION ALL
SELECT 
    'auth.sessions' as table_name, 
    COUNT(*) as record_count,
    'SHOULD BE 0' as expected
FROM auth.sessions
UNION ALL
SELECT 
    'auth.refresh_tokens' as table_name, 
    COUNT(*) as record_count,
    'SHOULD BE 0' as expected
FROM auth.refresh_tokens
UNION ALL
SELECT 
    'auth.audit_log_entries' as table_name, 
    COUNT(*) as record_count,
    'Any number OK' as expected
FROM auth.audit_log_entries
ORDER BY table_name;

-- Step 6: Final confirmation message
SELECT 'DATABASE CLEANUP COMPLETE - ALL USERS DELETED' as status;
