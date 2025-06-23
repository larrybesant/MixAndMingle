/**
 * Simple user cleanup script using existing app configuration
 * Run this from the browser console or as a Next.js API route
 */

import { supabase } from '@/lib/supabase/client'

export async function clearAllUsersFromBrowser() {
  try {
    console.log('🧹 Starting user cleanup from browser...')
    
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
      return
    }
    
    console.log(`Found ${profiles?.length || 0} profiles:`)
    profiles?.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.username || profile.full_name || 'No name'} (${profile.id})`)
    })
    
    if (!profiles || profiles.length === 0) {
      console.log('✅ No profiles found - database is already clean!')
      return
    }
    
    // Clear profiles (this will work with RLS policies)
    console.log('\n🗑️  Clearing profiles...')
    const { error: clearError } = await supabase
      .from('profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Safety check
    
    if (clearError) {
      console.error('❌ Error clearing profiles:', clearError)
      console.log('💡 You may need admin access or manual deletion from Supabase dashboard')
      return
    }
    
    console.log('✅ Profiles cleared successfully!')
    
    // Sign out current user
    if (currentUser.user) {
      console.log('\n🚪 Signing out current user...')
      await supabase.auth.signOut()
      console.log('✅ Signed out')
    }
    
    console.log('\n🎉 User cleanup complete!')
    console.log('✨ Ready to test first account creation')
    console.log('🔄 Please refresh the page to start fresh')
    
  } catch (error) {
    console.error('❌ Unexpected error during cleanup:', error)
  }
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  console.log('🧹 User Cleanup Script Loaded')
  console.log('📋 Run clearAllUsersFromBrowser() to start cleanup')
}
