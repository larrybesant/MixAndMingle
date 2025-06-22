import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test database connection and trigger
    const tests = [];
    
    // Test 1: Check if profiles table exists
    const { data: profilesTest, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
      
    tests.push({
      test: 'Profiles table accessible',
      status: profilesError ? 'fail' : 'pass',
      error: profilesError?.message
    });
    
    // Test 2: Check if trigger function exists
    const { data: triggerTest, error: triggerError } = await supabase
      .rpc('exec_sql', { 
        sql_statement: "SELECT proname FROM pg_proc WHERE proname = 'handle_new_user'" 
      });
      
    tests.push({
      test: 'Trigger function exists', 
      status: triggerError ? 'fail' : 'pass',
      error: triggerError?.message,
      data: triggerTest
    });
    
    return NextResponse.json({
      success: true,
      message: 'Database diagnostics complete',
      tests,
      suggestion: 'If trigger test fails, the 405 error is likely due to missing trigger function'
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      suggestion: 'Check Supabase configuration and database setup'
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({
    message: 'Use GET to run database diagnostics'
  });
}
