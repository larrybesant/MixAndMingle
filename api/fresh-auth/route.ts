import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Fresh, clean login API
export async function POST(request: Request) {
  try {
    const { email, password, action = 'login', metadata } = await request.json();

    console.log(`🔄 Fresh auth: ${action} for ${email}`);

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json({ 
        success: false,
        error: 'Email and password are required' 
      }, { status: 400 });
    }

    // Clean email format
    const cleanEmail = email.toLowerCase().trim();

    // Create fresh Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );    if (action === 'signup') {
      console.log('📝 Creating new account...');
      
      // Use regular signup with disabled email confirmation for immediate access
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            username: metadata?.username || `user_${Date.now()}`,
            full_name: metadata?.full_name || metadata?.username || 'New User'
          }
        }
      });

      if (signupError) {
        console.error('❌ Signup error:', signupError.message);
        return NextResponse.json({ 
          success: false,
          error: signupError.message 
        }, { status: 400 });
      }

      if (!signupData.user) {
        return NextResponse.json({ 
          success: false,
          error: 'User creation failed' 
        }, { status: 400 });
      }

      console.log('✅ User created:', signupData.user.id);

      // If email confirmation is required, the user won't be immediately confirmed
      // Let's check if they need email verification
      const needsEmailVerification = !signupData.user.email_confirmed_at && !signupData.session;

      if (needsEmailVerification) {
        console.log('📧 Email verification required');
        return NextResponse.json({
          success: true,
          user: {
            id: signupData.user.id,
            email: signupData.user.email,
            emailConfirmed: false
          },
          message: 'Account created. Please check your email for verification.',
          requiresEmailVerification: true
        });
      }

      // Create basic profile for confirmed users
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: signupData.user.id,
          email: cleanEmail,
          username: metadata?.username || `user_${Date.now()}`,
          bio: 'New user',
          music_preferences: ['electronic'],
          avatar_url: '/default-avatar.png',
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.warn('⚠️ Profile creation warning:', profileError.message);
        // Don't fail signup for profile issues
      }

      return NextResponse.json({
        success: true,
        user: {
          id: signupData.user.id,
          email: signupData.user.email,
          emailConfirmed: !!signupData.user.email_confirmed_at
        },
        session: signupData.session,
        message: 'Account created successfully'
      });
    }

    // Login attempt
    console.log('🔐 Attempting login...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });

    if (loginError) {
      console.error('❌ Login error:', loginError.message);
      
      let errorMessage = 'Login failed';
      let suggestion = '';

      if (loginError.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
        suggestion = 'Double-check your credentials or create a new account';
      } else if (loginError.message.includes('Email not confirmed')) {
        errorMessage = 'Email not verified';
        suggestion = 'Check your email for verification link';
      }

      return NextResponse.json({ 
        success: false,
        error: errorMessage,
        suggestion: suggestion
      }, { status: 400 });
    }

    console.log('✅ Login successful:', loginData.user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: loginData.user.id,
        email: loginData.user.email,
        emailConfirmed: !!loginData.user.email_confirmed_at
      },
      session: {
        access_token: loginData.session.access_token,
        expires_at: loginData.session.expires_at
      },
      message: 'Login successful'
    });

  } catch (error: any) {
    console.error('💥 Fresh auth error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Authentication failed',
      debug: error.message
    }, { status: 500 });
  }
}
