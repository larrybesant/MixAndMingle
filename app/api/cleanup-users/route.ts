import { NextResponse } from 'next/server';

export async function DELETE() {
  try {
    console.log('🧹 API: Starting user cleanup...');
    
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Supabase not configured properly',
        configured: false
      }, { status: 500 });
    }

    // Use service role key for admin operations
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, username');

    if (profilesError) {
      return NextResponse.json({
        error: 'Failed to fetch profiles',
        details: profilesError.message
      }, { status: 500 });
    }

    console.log(`Found ${profiles?.length || 0} profiles to delete`);

    // Delete all profiles
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('Profile deletion error:', deleteError);
      return NextResponse.json({
        error: 'Failed to delete profiles',
        details: deleteError.message,
        suggestion: 'Try using browser console script or manual deletion'
      }, { status: 500 });
    }    // Clean related tables
    const tablesToClean = ['user_swipes', 'matches', 'messages', 'notifications'];
    const cleanupResults: Record<string, string> = {};

    for (const table of tablesToClean) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        cleanupResults[table] = error ? `Error: ${error.message}` : 'Cleaned';
      } catch (err: any) {
        cleanupResults[table] = `Table might not exist: ${err.message || 'Unknown error'}`;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'All users and data deleted successfully',
      deletedProfiles: profiles?.length || 0,
      cleanupResults,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('API cleanup error:', error);
    return NextResponse.json({
      error: 'Cleanup operation failed',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'User cleanup endpoint',
    usage: 'Send DELETE request to delete all users',
    warning: 'This will permanently delete all user data'
  });
}
