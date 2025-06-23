import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ 
      error: 'Supabase not configured - missing environment variables',
      configured: false
    }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  
  if (!email) {
    return NextResponse.json({ 
      error: 'Email parameter required. Usage: /api/check-user?email=your@email.com' 
    }, { status: 400 });
  }

  try {
    // Dynamically import and initialize Supabase only when needed
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if user exists in auth.users (we can't query this directly, so we'll try a password reset)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/reset-password',
    });

    // If no error, user exists
    if (!error) {
      return NextResponse.json({
        exists: true,
        message: 'User found! Password reset email sent (you can ignore it).',
        email: email
      });
    }

    // Check specific error messages
    if (error.message.includes('User not found') || error.message.includes('Unable to validate email address')) {
      return NextResponse.json({
        exists: false,
        message: 'No user found with this email address. You may need to sign up first.',
        email: email,
        suggestion: 'Try signing up at /signup'
      });
    }

    return NextResponse.json({
      exists: 'unknown',
      message: 'Could not determine if user exists.',
      error: error.message,
      email: email
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return NextResponse.json({
      error: 'Failed to check user',
      details: errorMessage,
      email: email
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ 
      error: 'Supabase not configured - missing environment variables',
      configured: false
    }, { status: 500 });
  }

  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email and password required' 
      }, { status: 400 });
    }

    // Dynamically import and initialize Supabase only when needed
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to create a test user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          username: email.split('@')[0] + '_test',
          created_via: 'admin_tool'
        }
      }
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        suggestion: error.message.includes('already registered') 
          ? 'User already exists. Try logging in or reset password.'
          : 'There was an issue creating the account.'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully!',
      userId: data.user?.id,
      emailConfirmed: data.user?.email_confirmed_at ? true : false
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return NextResponse.json({
      error: 'Failed to create test user',
      details: errorMessage
    }, { status: 500 });
  }
}
