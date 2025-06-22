import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, metadata } = body;
    
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email and password are required' 
      }, { status: 400 });
    }

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ 
        error: 'Supabase configuration missing' 
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Attempt to sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {},
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        details: error
      }, { status: 400 });
    }

    // Check if user was created successfully
    if (data.user) {
      return NextResponse.json({ 
        message: 'User created successfully',
        user: {
          id: data.user.id,
          email: data.user.email,
          email_confirmed: data.user.email_confirmed_at ? true : false
        },
        session: data.session ? 'Created' : 'Pending email confirmation'
      });
    } else {
      return NextResponse.json({ 
        error: 'User creation failed - no user data returned' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Signup API endpoint',
    usage: 'POST with { email, password, metadata? }',
    redirect_url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  });
}
