import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const { action, confirm, userId } = await request.json();
    
    console.log('🚨 Emergency cleanup request:', action);
    
    switch (action) {
      case 'count_users':
        return await countAllUsers();
      
      case 'delete_all_users':
        if (confirm !== 'YES_DELETE_ALL') {
          return NextResponse.json(
            { error: 'Confirmation required' },
            { status: 400 }
          );
        }
        return await deleteAllUsers();
      
      case 'delete_specific_user':
        if (confirm !== 'YES_DELETE_SPECIFIC' || !userId) {
          return NextResponse.json(
            { error: 'Confirmation and userId required' },
            { status: 400 }
          );
        }
        return await deleteSpecificUser(userId);
      
      case 'verify_specific_user':
        if (!userId) {
          return NextResponse.json(
            { error: 'userId required' },
            { status: 400 }
          );
        }
        return await verifySpecificUser(userId);
      
      case 'verify_cleanup':
        return await verifyCleanup();
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }} catch (error) {
    console.error('Emergency cleanup error:', error);
    return NextResponse.json(
      { 
        error: 'Emergency cleanup failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function countAllUsers() {
  try {
    // Count auth users
    const { data: authUsers, error: authError } = await supabaseAdmin
      .from('auth.users')
      .select('id', { count: 'exact' });
    
    // Count profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact' });
    
    if (authError) {
      console.error('Auth users count error:', authError);
    }
    
    if (profileError) {
      console.error('Profiles count error:', profileError);
    }
    
    return NextResponse.json({
      success: true,
      authUsers: authUsers?.length || 0,
      profiles: profiles?.length || 0,
      totalUsers: (authUsers?.length || 0) + (profiles?.length || 0),
      errors: {
        auth: authError?.message,
        profiles: profileError?.message
      }
    });
  } catch (error) {    return NextResponse.json({
      error: 'Failed to count users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function deleteAllUsers() {
  const results = {
    deletedProfiles: 0,
    deletedAuthUsers: 0,
    errors: [] as string[]
  };
  
  try {
    console.log('🗑️ Starting emergency user deletion...');
    
    // First, get all users to delete them one by one
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      results.errors.push(`List users error: ${listError.message}`);
    }
    
    if (authUsers?.users) {
      console.log(`Found ${authUsers.users.length} auth users to delete`);
      
      // Delete each user individually
      for (const user of authUsers.users) {
        try {
          // Delete from auth.users (this should cascade to profiles due to foreign key)
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
          
          if (deleteError) {
            console.error(`Error deleting user ${user.id}:`, deleteError);
            results.errors.push(`Delete user ${user.id}: ${deleteError.message}`);
          } else {
            results.deletedAuthUsers++;
            console.log(`✅ Deleted user: ${user.id}`);
          }        } catch (userError) {
          console.error(`Exception deleting user ${user.id}:`, userError);
          results.errors.push(`Exception deleting ${user.id}: ${userError instanceof Error ? userError.message : 'Unknown error'}`);
        }
      }
    }
    
    // Also try to delete any remaining profiles directly
    try {
      const { error: profileDeleteError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except impossible ID
      
      if (profileDeleteError) {
        console.error('Error deleting profiles:', profileDeleteError);
        results.errors.push(`Delete profiles error: ${profileDeleteError.message}`);
      } else {
        console.log('✅ Deleted remaining profiles');
      }    } catch (profileError) {
      console.error('Exception deleting profiles:', profileError);
      results.errors.push(`Profile deletion exception: ${profileError instanceof Error ? profileError.message : 'Unknown error'}`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Emergency cleanup completed',
      results: results
    });
      } catch (error) {
    console.error('Emergency deletion failed:', error);
    return NextResponse.json({
      error: 'Emergency deletion failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      results: results
    }, { status: 500 });
  }
}

async function verifyCleanup() {
  try {
    // Check auth users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    // Check profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id');
    
    const authCount = authUsers?.users?.length || 0;
    const profileCount = profiles?.length || 0;
    
    return NextResponse.json({
      success: true,
      verification: {
        authUsers: authCount,
        profiles: profileCount,
        totalUsers: authCount + profileCount,
        isClean: authCount === 0 && profileCount === 0
      },
      errors: {
        auth: authError?.message,
        profiles: profileError?.message
      }
    });  } catch (error) {
    return NextResponse.json({
      error: 'Verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function deleteSpecificUser(userId: string) {
  try {
    console.log(`🎯 Deleting specific user: ${userId}`);
    
    // Delete the user using admin API
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error(`Error deleting user ${userId}:`, deleteError);
      return NextResponse.json({
        success: false,
        error: `Failed to delete user: ${deleteError.message}`,
        userId: userId
      }, { status: 400 });
    }
    
    // Also try to delete from profiles table directly
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.warn(`Profile deletion warning for ${userId}:`, profileError);
    }
    
    return NextResponse.json({
      success: true,
      message: `User ${userId} deleted successfully`,
      userId: userId
    });
    
  } catch (error) {
    console.error(`Exception deleting user ${userId}:`, error);
    return NextResponse.json({
      success: false,
      error: 'Exception during user deletion',
      details: error instanceof Error ? error.message : 'Unknown error',
      userId: userId
    }, { status: 500 });
  }
}

async function verifySpecificUser(userId: string) {
  try {
    console.log(`🔍 Verifying user ${userId} deletion...`);
    
    // Check if user exists in auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    // Check if user exists in profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    const authUserExists = authUser?.user != null && !authError;
    const profileExists = profile != null && !profileError;
    
    return NextResponse.json({
      success: true,
      verification: {
        userId: userId,
        authUserExists: authUserExists,
        profileExists: profileExists,
        userExists: authUserExists || profileExists
      },
      errors: {
        auth: authError?.message,
        profile: profileError?.message
      }
    });
    
  } catch (error) {
    console.error(`Exception verifying user ${userId}:`, error);
    return NextResponse.json({
      success: false,
      error: 'Exception during user verification',
      details: error instanceof Error ? error.message : 'Unknown error',
      userId: userId
    }, { status: 500 });
  }
}
