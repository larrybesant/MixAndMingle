import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password, action = 'login' } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email and password are required' 
      }, { status: 400 });
    }

    console.log(`🔐 Emergency auth request: ${action} for ${email}`);

    if (action === 'signup') {
      // Create account
      const { data: signupData, error: signupError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        password: password,
        email_confirm: true // Auto-confirm
      });

      if (signupError) {
        console.error('Signup error:', signupError);
        return NextResponse.json({ 
          error: signupError.message,
          success: false
        }, { status: 400 });
      }

      // Create profile
      if (signupData.user) {
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: signupData.user.id,
            username: `user${Date.now()}`,
            email: signupData.user.email,
            bio: 'New user',
            music_preferences: ['pop'],
            avatar_url: '/default-avatar.png'
          });

        if (profileError) {
          console.log('Profile creation warning:', profileError.message);
        }
      }

      return NextResponse.json({
        success: true,
        user: signupData.user,
        message: 'Account created successfully'
      });
    }

    // Login
    const { data: loginData, error: loginError } = await supabaseAdmin.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password
    });

    if (loginError) {
      console.error('Login error:', loginError);
      return NextResponse.json({ 
        error: loginError.message,
        success: false
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: loginData.user,
      session: loginData.session,
      message: 'Login successful'
    });

  } catch (error: any) {
    console.error('Emergency auth error:', error);
    return NextResponse.json({ 
      error: 'Authentication failed',
      debug: error.message,
      success: false
    }, { status: 500 });
  }
}
