import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// This API endpoint clears all users - USE WITH CAUTION!
export async function POST() {
  try {
    console.log('🧹 Starting user cleanup...')

    // Initialize Supabase with service role key for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        error: 'Missing Supabase environment variables',
        message: 'Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY' 
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Step 1: Get all profiles first
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, full_name')

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
    } else {
      console.log(`Found ${profiles?.length || 0} profiles to delete`)
    }

    // Step 2: Clear profiles table
    const { error: clearProfilesError } = await supabase
      .from('profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Safety check

    if (clearProfilesError) {
      console.error('Error clearing profiles:', clearProfilesError)
      return NextResponse.json({ 
        error: 'Failed to clear profiles', 
        details: clearProfilesError 
      }, { status: 500 })
    }

    // Step 3: Get and delete auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    let deletedAuthUsers = 0
    if (authError) {
      console.error('Error fetching auth users:', authError)
    } else {
      console.log(`Found ${authUsers.users?.length || 0} auth users to delete`)
      
      // Delete each auth user
      if (authUsers.users && authUsers.users.length > 0) {
        for (const user of authUsers.users) {
          const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
          if (deleteError) {
            console.error(`Error deleting user ${user.id}:`, deleteError)
          } else {
            deletedAuthUsers++
            console.log(`Deleted user: ${user.email || user.id}`)
          }
        }
      }
    }

    // Step 4: Verify cleanup
    const { data: remainingProfiles } = await supabase.from('profiles').select('id')
    const { data: remainingAuthUsers } = await supabase.auth.admin.listUsers()

    const result = {
      success: true,
      message: 'User cleanup completed',
      details: {
        profilesDeleted: profiles?.length || 0,
        authUsersDeleted: deletedAuthUsers,
        remainingProfiles: remainingProfiles?.length || 0,
        remainingAuthUsers: remainingAuthUsers?.users?.length || 0
      }
    }

    console.log('Cleanup result:', result)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Unexpected error during cleanup:', error)
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// Also allow GET for easier testing
export async function GET() {
  return NextResponse.json({ 
    message: 'User cleanup endpoint ready. Send POST request to clear all users.',
    warning: '⚠️ This will delete ALL users from the database!'
  })
}
