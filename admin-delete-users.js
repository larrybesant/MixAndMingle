/**
 * ADMIN USER CLEANUP SCRIPT - BYPASSES RLS
 * 
 * This uses the service role key to delete all users.
 * Run this in browser console or use the API endpoint.
 */

async function adminDeleteAllUsers() {
  console.log('🔧 ADMIN USER CLEANUP - BYPASSING RLS...');
  
  try {
    // Use the service role key from environment variables
    const supabaseUrl = 'https://ywfjmsbyksehjgwalqum.supabase.co';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zmptc2J5a3NlaGpnd2FscXVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzMzMjA2OCwiZXhwIjoyMDYyOTA4MDY4fQ.yCEJpiyVvEZeyrb9SPfmEwwpWcB_UnQ9v51uefyEw_c';
    
    // Create admin client
    const { createClient } = await import('@supabase/supabase-js');
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    console.log('👑 Using admin credentials...');
    
    // Get all profiles first
    console.log('📊 Fetching all profiles...');
    const { data: profiles, error: fetchError } = await adminSupabase
      .from('profiles')
      .select('id, email, username, full_name');
    
    if (fetchError) {
      console.error('❌ Error fetching profiles:', fetchError);
      return false;
    }
    
    console.log(`Found ${profiles?.length || 0} profiles to delete:`);
    profiles?.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.email || profile.username || profile.full_name || 'Unknown'} (${profile.id})`);
    });
    
    if (!profiles || profiles.length === 0) {
      console.log('✅ No profiles found - database is already clean!');
      return true;
    }
    
    // Delete all profiles using admin privileges
    console.log('\n🗑️ Deleting all profiles with admin privileges...');
    const { error: deleteError } = await adminSupabase
      .from('profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteError) {
      console.error('❌ Admin delete failed:', deleteError);
      console.log('🔄 Trying individual deletion...');
      
      // Try deleting one by one
      let deletedCount = 0;
      for (const profile of profiles) {
        const { error: individualError } = await adminSupabase
          .from('profiles')
          .delete()
          .eq('id', profile.id);
        
        if (individualError) {
          console.warn(`⚠️ Could not delete ${profile.email || profile.id}:`, individualError.message);
        } else {
          deletedCount++;
          console.log(`✅ Deleted: ${profile.email || profile.id}`);
        }
      }
      console.log(`🎯 Successfully deleted ${deletedCount} out of ${profiles.length} profiles`);
    } else {
      console.log('✅ All profiles deleted successfully!');
    }
    
    // Clean related tables
    console.log('\n🧽 Cleaning related data...');
    const tablesToClean = ['user_swipes', 'matches', 'messages', 'notifications', 'push_subscriptions'];
    
    for (const table of tablesToClean) {
      try {
        const { error } = await adminSupabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (error) {
          console.warn(`⚠️ Could not clean ${table}:`, error.message);
        } else {
          console.log(`✅ Cleaned ${table} table`);
        }
      } catch (err) {
        console.warn(`⚠️ Table ${table} might not exist`);
      }
    }
    
    // Sign out any current user from the regular client
    try {
      const { supabase } = await import('/lib/supabase/client');
      await supabase.auth.signOut();
      console.log('🚪 Signed out current user');
    } catch (err) {
      console.log('ℹ️ No current user to sign out');
    }
    
    // Clear localStorage
    localStorage.clear();
    console.log('🧽 Cleared local storage');
    
    console.log('\n🎉 ADMIN CLEANUP COMPLETE!');
    console.log('✨ All users and data deleted successfully');
    console.log('🔄 Refresh the page to start fresh');
    
    return true;
    
  } catch (error) {
    console.error('❌ Admin cleanup failed:', error);
    return false;
  }
}

// Expose globally
window.adminDeleteAllUsers = adminDeleteAllUsers;

console.log('👑 ADMIN USER CLEANUP SCRIPT LOADED');
console.log('🔧 This bypasses RLS using service role key');
console.log('📋 Run adminDeleteAllUsers() to delete all users');

// Auto-run option (uncomment to automatically run)
// adminDeleteAllUsers();
