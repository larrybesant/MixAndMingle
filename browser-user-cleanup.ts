/**
 * Enhanced user cleanup script for persistent users
 * Handles the stubborn user: larrybesant@gmail.com (48a955b2-040e-4add-9342-625e1ffdca43)
 */

import { supabase } from '@/lib/supabase/client'

export async function clearAllUsersFromBrowser() {
  try {
    console.log('🧹 Starting enhanced user cleanup from browser...')
    
    // Check current user first
    const { data: currentUser } = await supabase.auth.getUser()
    if (currentUser.user) {
      console.log('ℹ️  Currently logged in as:', currentUser.user.email)
      console.log('⚠️  You will be logged out after cleanup')
    }
    
    // Get all profiles to see what we're clearing
    console.log('\n📊 Checking profiles to clear...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, full_name, email')
      if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
      console.log('🔧 Trying admin API cleanup instead...')
      return await useAdminAPICleanup()
    }

    console.log(`Found ${profiles?.length || 0} profiles:`)
    profiles?.forEach((profile: any, index: number) => {
      console.log(`${index + 1}. ${profile.username || profile.full_name || 'No name'} (${profile.id})`)
    })
    
    if (!profiles || profiles.length === 0) {
      console.log('✅ No profiles found - checking auth users with admin API...')
      return await useAdminAPICleanup()
    }
    
    // Clear profiles (this will work with RLS policies)
    console.log('\n🗑️  Clearing profiles...')
    const { error: clearError } = await supabase
      .from('profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Safety check
    
    if (clearError) {
      console.error('❌ Error clearing profiles:', clearError)
      console.log('� Switching to admin API cleanup...')
      return await useAdminAPICleanup()
    }
    
    console.log('✅ Profiles cleared successfully!')
    
    // Also try admin API cleanup to ensure auth users are deleted
    console.log('\n🔧 Running admin API cleanup to ensure complete deletion...')
    await useAdminAPICleanup()
    
    // Sign out current user
    if (currentUser.user) {
      console.log('\n🚪 Signing out current user...')
      await supabase.auth.signOut()
      console.log('✅ Signed out')
    }
    
    console.log('\n🎉 Enhanced cleanup complete!')
    console.log('✨ Ready to test first account creation')
    console.log('🔄 Please refresh the page to start fresh')
    
  } catch (error) {
    console.error('❌ Unexpected error during cleanup:', error)
    console.log('🔧 Trying fallback admin cleanup...')
    await useAdminAPICleanup()
  }
}

// Enhanced admin API cleanup for persistent users
async function useAdminAPICleanup() {
  try {
    console.log('🚨 Using admin API for stubborn user cleanup...')
    
    // First check how many users exist
    const countResponse = await fetch('/api/admin/emergency-cleanup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'count_users' })
    })
    
    const countResult = await countResponse.json()
    console.log('👥 Current user count:', countResult)
    
    if (countResult.totalUsers === 0) {
      console.log('✅ No users found - database is clean!')
      return
    }
    
    // Try to delete the specific problematic user first
    const specificUserId = '48a955b2-040e-4add-9342-625e1ffdca43'
    console.log(`🎯 Targeting specific user: ${specificUserId}`)
    
    const deleteSpecificResponse = await fetch('/api/admin/emergency-cleanup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete_specific_user',
        userId: specificUserId,
        confirm: 'YES_DELETE_SPECIFIC'
      })
    })
    
    const deleteSpecificResult = await deleteSpecificResponse.json()
    console.log('🗑️ Specific user deletion:', deleteSpecificResult)
    
    // Wait a moment then verify
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const verifyResponse = await fetch('/api/admin/emergency-cleanup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify_specific_user',
        userId: specificUserId
      })
    })
    
    const verifyResult = await verifyResponse.json()
    console.log('🔍 Verification result:', verifyResult)
    
    if (verifyResult.verification?.userExists === false) {
      console.log('🎉 Specific user successfully deleted!')
    } else {
      console.log('⚠️ User still exists, trying nuclear option...')
      await forceDeleteAllUsers()
    }
    
  } catch (error) {
    console.error('❌ Admin API cleanup failed:', error)
    console.log('📋 Manual steps required - check MANUAL_STEPS below')
    showManualSteps()
  }
}

// Nuclear option - delete ALL users
async function forceDeleteAllUsers() {
  try {
    console.log('💥 NUCLEAR OPTION: Deleting ALL users via admin API...')
    
    const response = await fetch('/api/admin/emergency-cleanup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete_all_users',
        confirm: 'YES_DELETE_ALL'
      })
    })
    
    const result = await response.json()
    console.log('💥 Nuclear deletion result:', result)
    
    // Final verification
    setTimeout(async () => {
      const finalCheck = await fetch('/api/admin/emergency-cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_cleanup' })
      })
      
      const finalResult = await finalCheck.json()
      console.log('🏁 Final verification:', finalResult)
      
      if (finalResult.verification?.totalUsers === 0) {
        console.log('🎉 SUCCESS: All users finally deleted!')
        console.log('✨ Database is now completely clean')
      } else {
        console.log('😤 Some users STILL remain - manual SQL required')
        showManualSteps()
      }
    }, 2000)
    
  } catch (error) {
    console.error('❌ Nuclear option failed:', error)
    showManualSteps()
  }
}

// Show manual steps as last resort
function showManualSteps() {
  console.log(`
🆘 MANUAL STEPS REQUIRED:

1. 🗃️ SQL Method (Most Reliable):
   - Go to https://supabase.com/dashboard
   - Open SQL Editor
   - Run this query:
   
   DELETE FROM profiles WHERE id = '48a955b2-040e-4add-9342-625e1ffdca43';
   DELETE FROM auth.users WHERE id = '48a955b2-040e-4add-9342-625e1ffdca43';
   DELETE FROM auth.sessions WHERE user_id = '48a955b2-040e-4add-9342-625e1ffdca43';
   DELETE FROM auth.refresh_tokens WHERE user_id = '48a955b2-040e-4add-9342-625e1ffdca43';

2. 🖱️ Dashboard Method:
   - Go to Authentication → Users
   - Find larrybesant@gmail.com
   - Click Delete User in danger zone

3. 🔥 Nuclear SQL (if above fails):
   - Run: DELETE FROM profiles; DELETE FROM auth.users;
  `)
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  console.log('🧹 Enhanced User Cleanup Script Loaded')
  console.log('🎯 Targets persistent user: larrybesant@gmail.com')
  console.log('📋 Run clearAllUsersFromBrowser() to start enhanced cleanup')
  console.log('💥 Includes nuclear option for stubborn users')
}
