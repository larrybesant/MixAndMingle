-- SUPABASE SQL CLEANUP SCRIPT
-- Run this in Supabase Dashboard → SQL Editor

-- First, disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_swipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Delete all data
DELETE FROM notifications;
DELETE FROM messages;
DELETE FROM matches;
DELETE FROM user_swipes;
DELETE FROM profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Verify cleanup
SELECT 'profiles' as table_name, COUNT(*) as remaining_rows FROM profiles
UNION ALL
SELECT 'user_swipes', COUNT(*) FROM user_swipes
UNION ALL
SELECT 'matches', COUNT(*) FROM matches
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;
