import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { access_token, refresh_token, type } = await request.json();
    
    if (!access_token || !refresh_token) {
      return NextResponse.json({ 
        error: 'Missing tokens' 
      }, { status: 400 });
    }

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Set the session with the provided tokens
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.json({ 
        error: error.message 
      }, { status: 400 });
    }

    // If this is a password recovery callback
    if (type === 'recovery') {
      return NextResponse.json({ 
        message: 'Recovery session set successfully',
        redirect: '/reset-password'
      });
    }

    return NextResponse.json({ 
      message: 'Session set successfully',
      user: data.user
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Auth Callback API',
    usage: 'POST with tokens to set auth session'
  });
}
