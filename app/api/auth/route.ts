import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { action, ...params } = await request.json();
    
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    switch (action) {
      case 'reset-password': {
        const { email } = params;
        if (!email) {
          return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/reset-password`,
        });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ message: 'Password reset email sent successfully' });
      }

      case 'update-password': {
        const { password, access_token } = params;
        if (!password) {
          return NextResponse.json({ error: 'Password is required' }, { status: 400 });
        }

        // If access_token is provided, set the session first
        if (access_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token: params.refresh_token,
          });

          if (sessionError) {
            return NextResponse.json({ error: sessionError.message }, { status: 400 });
          }
        }

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ message: 'Password updated successfully' });
      }

      case 'verify-email': {
        const { email } = params;
        if (!email) {
          return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const { error } = await supabase.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth/callback`,
          },
        });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ message: 'Verification email sent successfully' });
      }

      case 'signup': {
        const { email, password, metadata } = params;
        if (!email || !password) {
          return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata || {},
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
          },
        });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ 
          message: 'User created successfully. Please check your email for verification.',
          user: data.user,
          requiresVerification: !data.session
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Auth API',
    actions: ['reset-password', 'update-password', 'verify-email', 'signup']
  });
}
