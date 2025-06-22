import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email, password, test = false } = await request.json();
    
    console.log('🔐 Login diagnostic request:', { 
      email: email?.length ? `${email.substring(0, 3)}***` : 'missing',
      hasPassword: !!password,
      test 
    });

    // Get Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase configuration',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey
        }
      }, { status: 500 });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (test) {
      // Return configuration test
      return NextResponse.json({
        success: true,
        test: true,
        config: {
          supabaseUrl,
          keyLength: supabaseKey.length,
          timestamp: new Date().toISOString()
        },
        message: 'Supabase configuration is working'
      });
    }

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    console.log('🔐 Login attempt result:', {
      success: !error,
      userId: data?.user?.id,
      hasSession: !!data?.session,
      error: error?.message
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        errorCode: error.status,
        suggestion: getSuggestionForError(error.message)
      }, { status: 400 });
    }

    if (data.user) {
      return NextResponse.json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          emailConfirmed: !!data.user.email_confirmed_at,
          lastSignIn: data.user.last_sign_in_at
        },
        session: {
          hasAccessToken: !!data.session?.access_token,
          expiresAt: data.session?.expires_at
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Login completed but no user data returned'
    }, { status: 500 });

  } catch (error: any) {
    console.error('💥 Login diagnostic error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

function getSuggestionForError(errorMessage: string): string {
  if (errorMessage.includes('Invalid login credentials')) {
    return 'Double-check your email and password. Remember, email verification is disabled, so you can login immediately after signup.';
  }
  if (errorMessage.includes('Email not confirmed')) {
    return 'This error shouldn\'t occur since email verification is disabled. Try signing up again.';
  }
  if (errorMessage.includes('User not found')) {
    return 'No account exists with this email. Please sign up first.';
  }
  if (errorMessage.includes('Too many requests')) {
    return 'Please wait a moment before trying again.';
  }
  return 'Please try again or contact support if the issue persists.';
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'login-diagnostic',
    methods: ['POST'],
    description: 'Diagnostic endpoint for testing login functionality',
    usage: {
      test: 'POST with { "test": true } to check configuration',
      login: 'POST with { "email": "...", "password": "..." } to test login'
    }
  });
}
