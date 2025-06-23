import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    let email = 'force@example.com';
    let password = 'bypass';
    
    try {
      const body = await request.json();
      email = body.email || email;
      password = body.password || password;
    } catch (e) {
      // Ignore JSON parsing errors, use defaults
    }

    console.log('🚨 Force login attempt for:', email);

    // Create a simple session token
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Store user data (this bypasses Supabase entirely)
    const userData = {
      id: `user_${Date.now()}`,
      email: email,
      username: `user${Date.now()}`,
      created_at: new Date().toISOString(),
      session_token: sessionToken
    };

    console.log('✅ Force login successful:', userData.id);

    // Set a cookie for the session
    const response = NextResponse.json({
      success: true,
      user: userData,
      message: 'Force login successful - bypassing all authentication',
      redirect: '/dashboard'
    });

    // Set session cookie
    response.cookies.set('force_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;

  } catch (error: any) {
    console.error('Force login error:', error);
    return NextResponse.json({ 
      error: 'Force login failed',
      debug: error.message,
      success: false
    }, { status: 500 });
  }
}
