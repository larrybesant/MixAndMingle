/**
 * Simple Browser-Based User Cleanup
 * Copy and paste this code in the browser console on your signup page
 */

async function deleteAllUsers() {
  console.log('🧹 Starting user cleanup from browser...');
  
  try {
    // Method 1: Try calling our API endpoint
    const response = await fetch('/api/clear-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ API cleanup successful:', result);
      return result;
    } else {
      console.log('⚠️ API cleanup failed, trying direct method...');
    }
  } catch (error) {
    console.log('⚠️ API not available, trying direct method...');
  }
  
  // Method 2: Direct client-side cleanup
  try {
    // Import Supabase client
    const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js');
    
    // Get Supabase config from window (if available)
    const supabaseUrl = window.location.origin.includes('localhost') 
      ? 'your-supabase-url' // Replace with your actual URL
      : process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = 'your-anon-key'; // Replace with your actual anon key
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Supabase config not available for direct cleanup');
      console.log('💡 Please manually delete users from Supabase dashboard:');
      console.log('1. Go to Supabase Dashboard');
      console.log('2. Authentication → Users → Delete all users');
      console.log('3. Table Editor → profiles → Delete all rows');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Clear profiles
    console.log('🗑️ Clearing profiles...');
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .neq('id', '');
    
    if (profileError) {
      console.error('❌ Profile deletion error:', profileError);
    } else {
      console.log('✅ Profiles cleared');
    }
    
    // Try to get current user and sign out
    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
      await supabase.auth.signOut();
      console.log('🚪 Signed out current user');
    }
    
    console.log('🎉 Cleanup complete! Refresh the page to test signup.');
    
  } catch (error) {
    console.error('❌ Direct cleanup failed:', error);
    console.log('');
    console.log('📋 MANUAL CLEANUP STEPS:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to "Authentication" → "Users"');
    console.log('3. Delete all existing users');
    console.log('4. Navigate to "Table Editor" → "profiles"');
    console.log('5. Delete all rows in the profiles table');
    console.log('6. Refresh your app and test signup');
  }
}

// Auto-run the cleanup
deleteAllUsers();
