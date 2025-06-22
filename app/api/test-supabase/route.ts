import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ 
        error: 'Supabase configuration missing',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey 
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test basic connectivity
    try {
      const { data, error } = await supabase.auth.getSession();
      
      return NextResponse.json({
        message: 'Supabase connectivity test',
        supabase_url: supabaseUrl,
        auth_test: {
          success: !error,
          error: error?.message || null
        },
        app_url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      });
      
    } catch (authError) {
      return NextResponse.json({
        message: 'Supabase auth test failed',
        error: authError instanceof Error ? authError.message : 'Unknown error'
      }, { status: 500 });
    }
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test endpoint error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
