import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = "larrybesant@gmail.com";

export async function GET(request: Request) {
  try {
    // Admin authentication check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Configuration missing' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
    }
    
    // Verify admin user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

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
