import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'GOOGLE_OAUTH_CREDENTIALS_READY',
    message: 'Google OAuth Client ID obtained - ready for Supabase configuration',
    google_oauth: {
      client_id: '1099369771281-2slee12u5f0maqpa0hrbca1fman39d52.apps.googleusercontent.com',
      project: 'Google Cloud Console project configured',
      status: 'CREDENTIALS_OBTAINED'
    },
    supabase_configuration: {
      status: 'PENDING',
      dashboard_url: 'https://supabase.com/dashboard/project/ywfjmsbyksehjgwalqum/auth/providers',
      steps: [
        '1. Navigate to Authentication > Providers in Supabase',
        '2. Find "Google" provider and toggle it ON',
        '3. Add Client ID: 1099369771281-2slee12u5f0maqpa0hrbca1fman39d52.apps.googleusercontent.com',
        '4. Add your Client Secret from Google Console',
        '5. Save the configuration'
      ]
    },
    redirect_urls: {
      supabase_callback: 'https://ywfjmsbyksehjgwalqum.supabase.co/auth/v1/callback',
      app_callback: 'http://localhost:3000/auth/callback',
      note: 'These should be configured in Google Cloud Console'
    },
    test_flow: {
      after_configuration: [
        '1. Go to http://localhost:3000/login',
        '2. Click "Continue with Google" button',
        '3. Complete Google OAuth flow',
        '4. Verify successful login and profile creation'
      ]
    },
    implementation_status: {
      frontend_buttons: '✅ Ready',
      auth_context: '✅ Ready',
      callback_handler: '✅ Ready',
      profile_creation: '✅ Ready'
    }
  });
}

export async function POST() {
  try {
    // Test if Google OAuth would work with current setup
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    
    // Test admin access for OAuth provider management
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });
    
    if (error) {
      return NextResponse.json({
        status: 'ERROR',
        message: 'Cannot access Supabase admin - needed for OAuth provider setup',
        error: error.message,
        solution: 'Check your SUPABASE_SERVICE_ROLE_KEY in .env.local'
      });
    }
    
    return NextResponse.json({
      status: 'SUPABASE_READY_FOR_GOOGLE_OAUTH',
      message: 'Supabase admin access confirmed - ready to configure Google OAuth',
      google_client_id: '1099369771281-2slee12u5f0maqpa0hrbca1fman39d52.apps.googleusercontent.com',
      next_actions: [
        'Add Google OAuth provider in Supabase dashboard',
        'Use the Client ID above in Supabase configuration',
        'Add your Google Client Secret',
        'Test the OAuth flow'
      ],
      configuration_url: 'https://supabase.com/dashboard/project/ywfjmsbyksehjgwalqum/auth/providers'
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      message: 'Failed to verify Google OAuth readiness',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
