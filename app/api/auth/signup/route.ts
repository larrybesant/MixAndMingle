import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { emailService } from '@/lib/email-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, metadata } = body;
    
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email and password are required' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Please enter a valid email address' 
      }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters long' 
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
    }    // Check if user was created successfully
    if (data.user) {
      let emailSent = false;
      let emailProvider = null;
      let emailError = null;

      // Try to send welcome email if email confirmation is required
      if (data.user.email_confirmed_at === null) {
        try {
          // Generate confirmation URL
          const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?type=signup&email=${encodeURIComponent(email)}`;
          
          const emailResult = await emailService.sendSignupConfirmation(email, confirmationUrl);
          
          emailSent = emailResult.success;
          emailProvider = emailResult.provider;
          
          if (!emailResult.success) {
            emailError = emailResult.error;
          }
        } catch (error) {
          console.error('Failed to send welcome email:', error);
          emailError = error instanceof Error ? error.message : 'Unknown email error';
        }
      }

      const emailStatus = emailService.getStatus();

      return NextResponse.json({ 
        message: 'User created successfully',
        user: {
          id: data.user.id,
          email: data.user.email,
          email_confirmed: data.user.email_confirmed_at ? true : false
        },
        session: data.session ? 'Created' : 'Pending email confirmation',
        email: {
          sent: emailSent,
          provider: emailProvider,
          configured: emailStatus.resend.configured || emailStatus.supabase.configured,
          error: emailError
        },
        next_steps: data.user.email_confirmed_at 
          ? ['You can now log in to your account']
          : emailSent 
            ? ['Check your email for a confirmation link', 'Check spam folder if needed']
            : ['Email confirmation required but email service not configured', 'Contact support for manual verification']
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
