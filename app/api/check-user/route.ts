import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  
  if (!email) {
    return NextResponse.json({ 
      error: 'Email parameter required. Usage: /api/check-user?email=your@email.com' 
    }, { status: 400 });
  }

  try {
    // Check if user exists in auth.users (we can't query this directly, so we'll try a password reset)
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
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

  } catch (err: any) {
    return NextResponse.json({
      error: 'Failed to check user',
      details: err.message,
      email: email
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email and password required' 
      }, { status: 400 });
    }

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

  } catch (err: any) {
    return NextResponse.json({
      error: 'Failed to create test user',
      details: err.message
    }, { status: 500 });
  }
}
