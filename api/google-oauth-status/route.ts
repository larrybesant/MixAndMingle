import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'GOOGLE_OAUTH_READY',
    message: 'Google OAuth code is implemented and ready for configuration',
    implementation: {
      login_form: '✅ Google Sign-In button available',
      signup_form: '✅ Google Sign-Up button available', 
      auth_callback: '✅ OAuth callback handler implemented',
      auth_context: '✅ OAuth provider support in auth context',
      supabase_client: '✅ OAuth method configured'
    },
    configuration_needed: {
      google_cloud_console: {
        status: 'REQUIRED',
        description: 'Create OAuth 2.0 credentials',
        url: 'https://console.cloud.google.com',
        steps: [
          '1. Create/select Google Cloud project',
          '2. Enable Google+ API',
          '3. Create OAuth 2.0 Client ID',
          '4. Add authorized domains and redirect URIs'
        ]
      },
      supabase_dashboard: {
        status: 'REQUIRED', 
        description: 'Configure Google provider in Supabase',
        url: 'https://supabase.com/dashboard/project/ywfjmsbyksehjgwalqum/auth/providers',
        steps: [
          '1. Navigate to Authentication > Providers',
          '2. Enable Google provider',
          '3. Add Google Client ID',
          '4. Add Google Client Secret'
        ]
      }
    },
    test_flow: {
      development: 'http://localhost:3000/login (click Google button)',
      callback_url: 'http://localhost:3000/auth/callback',
      supabase_redirect: 'https://ywfjmsbyksehjgwalqum.supabase.co/auth/v1/callback'
    },
    oauth_settings: {
      redirect_to: 'window.location.origin + /auth/callback',
      access_type: 'offline',
      prompt: 'consent',
      providers_supported: ['google', 'github', 'discord']
    },
    next_steps: [
      '1. Set up Google Cloud Console OAuth credentials',
      '2. Configure Google provider in Supabase dashboard', 
      '3. Test Google Sign-In flow',
      '4. Verify user profile creation after OAuth'
    ]
  });
}

export async function POST() {
  try {
    // Test if we can access the Supabase auth admin
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
      // Try to list users to confirm admin access
    const { error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });
    
    if (error) {
      return NextResponse.json({
        status: 'ERROR',
        message: 'Cannot access Supabase admin functions for OAuth testing',
        error: error.message,
        solution: 'Check your SUPABASE_SERVICE_ROLE_KEY in .env.local'
      });
    }
    
    return NextResponse.json({
      status: 'OAUTH_BACKEND_READY',
      message: 'Supabase admin access working - ready for Google OAuth',
      admin_access: 'OK',
      next_step: 'Configure Google OAuth in Supabase dashboard',
      dashboard_url: 'https://supabase.com/dashboard/project/ywfjmsbyksehjgwalqum/auth/providers'
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      message: 'Failed to test OAuth backend configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
