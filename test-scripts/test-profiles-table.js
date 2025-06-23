// Test and fix the profiles table issue
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vxtccehzjqjmxmyosqmg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dGNjZWh6anFqbXhteW9zcW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzMjE5NDcsImV4cCI6MjA0Nzg5Nzk0N30.9M7YPKIBqJdBvCFj4MaGwJWKKQhd3XRvR7OJwUw4WdY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAndFixProfilesTable() {
  console.log('🔍 Testing profiles table access...');
  
  try {
    // First, test if we can query the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Profiles table error:', error.message);
      
      if (error.message.includes('relation "public.profiles" does not exist')) {
        console.log('🔧 Table does not exist. This is the root cause of the stuck redirect!');
        console.log('📋 Solutions:');
        console.log('1. Run the database schema to create the profiles table');
        console.log('2. Or modify the login logic to skip profile checks temporarily');
        return false;
      }
      
      if (error.message.includes('permission denied')) {
        console.log('🔐 Permission issue. Need to check RLS policies or use service role key.');
        return false;
      }
      
      return false;
    } else {
      console.log('✅ Profiles table exists and is accessible!');
      console.log('📊 Sample data:', data);
      return true;
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err);
    return false;
  }
}

async function checkUserProfile() {
  console.log('👤 Checking if our test user has a profile...');
  
  // Test login to get user ID
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'larrybesant@gmail.com',
    password: 'NewPassword123!'
  });
  
  if (authError) {
    console.log('❌ Login failed:', authError.message);
    return;
  }
  
  console.log('✅ Login successful. User ID:', authData.user.id);
  
  // Check for profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();
  
  if (profileError) {
    console.log('❌ Profile query error:', profileError.message);
    if (profileError.code === 'PGRST116') {
      console.log('📝 No profile found for this user. This explains the stuck redirect!');
    }
  } else {
    console.log('✅ Profile found:', profileData);
  }
  
  // Sign out
  await supabase.auth.signOut();
}

async function main() {
  console.log('🚀 Testing profiles table and user profile...\n');
  
  const tableExists = await testAndFixProfilesTable();
  
  if (tableExists) {
    await checkUserProfile();
  }
  
  console.log('\n🎯 DIAGNOSIS COMPLETE');
  console.log('The stuck redirect is caused by one of these issues:');
  console.log('1. Profiles table does not exist in Supabase');
  console.log('2. User does not have a profile record');
  console.log('3. RLS policies block access to profiles table');
  console.log('\nNext steps: Fix the root cause or bypass profile check temporarily.');
}

main().catch(console.error);
