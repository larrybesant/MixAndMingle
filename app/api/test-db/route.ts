import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    console.log('🧪 Testing database connection and schema...');
    
    const tests = [];
    
    // Test 1: Basic connection
    const { data: basicTest, error: basicError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    tests.push({
      name: 'Basic Supabase Connection',
      success: !basicError,
      error: basicError?.message
    });
    
    // Test 2: Check if key tables exist
    const tablesToCheck = ['profiles', 'dj_rooms', 'chat_messages', 'user_swipes', 'matches'];
    
    for (const table of tablesToCheck) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        tests.push({
          name: `Table: ${table}`,
          success: !error,
          error: error?.message
        });
      } catch (err) {
        tests.push({
          name: `Table: ${table}`,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }
    
    // Test 3: Current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    tests.push({
      name: 'User Authentication',
      success: !userError && userData.user !== null,
      error: userError?.message || (userData.user ? 'User authenticated' : 'No user logged in')
    });    // Test 4: Live rooms query
    const { data: roomsData, error: roomsError } = await supabase
      .from('dj_rooms')
      .select('id, is_live')
      .eq('is_live', true)
      .limit(5);
    
    tests.push({
      name: 'Live Rooms Query',
      success: !roomsError,
      error: roomsError?.message,
      data: roomsData?.length || 0
    });
    
    const successCount = tests.filter(t => t.success).length;
    const totalTests = tests.length;
    
    return NextResponse.json({
      success: successCount === totalTests,
      summary: `${successCount}/${totalTests} tests passed`,
      tests,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Create some sample data for testing
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return NextResponse.json({
        success: false,
        error: 'Must be logged in to create test data'
      }, { status: 401 });
    }
    
    // Create a test room
    const testRoom = {
      id: `test-room-${Date.now()}`,
      name: 'Test Live Room',
      description: 'A test room for development',
      genre: 'Electronic',
      host_id: userData.user.id,
      is_live: true,
      viewer_count: Math.floor(Math.random() * 50) + 1,
      tags: ['test', 'development', 'music']
    };
    
    const { data, error } = await supabase
      .from('dj_rooms')
      .insert(testRoom)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test data created successfully',
      room: data
    });
    
  } catch (error) {
    console.error('❌ Test data creation failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
