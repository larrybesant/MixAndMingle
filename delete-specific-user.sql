-- SPECIFIC USER DELETION SQL
-- Run this in Supabase SQL Editor to delete the remaining user
-- Target: larrybesant@gmail.com (UID: 48a955b2-040e-4add-9342-625e1ffdca43)

-- Step 1: Delete from profiles table first (to avoid foreign key issues)
DELETE FROM profiles WHERE id = '48a955b2-040e-4add-9342-625e1ffdca43';

-- Step 2: Delete from auth.users table
DELETE FROM auth.users WHERE id = '48a955b2-040e-4add-9342-625e1ffdca43';

-- Step 3: Clean up any sessions or tokens for this user
DELETE FROM auth.sessions WHERE user_id = '48a955b2-040e-4add-9342-625e1ffdca43';
DELETE FROM auth.refresh_tokens WHERE user_id = '48a955b2-040e-4add-9342-625e1ffdca43';

-- Step 4: Verify deletion (should return 0 rows)
SELECT 
  'auth.users' as table_name, 
  COUNT(*) as count 
FROM auth.users 
WHERE id = '48a955b2-040e-4add-9342-625e1ffdca43'
UNION ALL
SELECT 
  'profiles' as table_name, 
  COUNT(*) as count 
FROM profiles 
WHERE id = '48a955b2-040e-4add-9342-625e1ffdca43'
UNION ALL
SELECT 
  'Total users remaining' as table_name, 
  COUNT(*) as count 
FROM auth.users;

-- Expected result: All counts should be 0
