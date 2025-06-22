import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Create Supabase client to check auth settings
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // Test email confirmation settings by attempting a signup with a test email
    const testEmail = `test-verification-${Date.now()}@example.com`;
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPass123!',
      options: {
        data: { username: 'testuser' },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    // Clean up - delete the test user immediately
    if (data.user) {
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    }

    return NextResponse.json({
      email_verification_status: {
        test_email: testEmail,
        user_created: !!data.user,
        immediately_confirmed: !!data.user?.email_confirmed_at,
        session_created: !!data.session,
        error: error?.message || null,
        requires_verification: !data.user?.email_confirmed_at && !!data.user
      },
      analysis: {
        if_immediately_confirmed: "Email confirmation is DISABLED in Supabase - users don't need to verify emails",
        if_requires_verification: "Email confirmation is ENABLED in Supabase - users should receive verification emails",
        if_error: "There may be an issue with the signup process or configuration"
      },
      recommendations: data.user?.email_confirmed_at ? [
        "Email confirmation is disabled in Supabase Auth settings",
        "Users are automatically confirmed and can use the app immediately", 
        "No verification emails will be sent",
        "To enable email verification: Go to Supabase Dashboard > Authentication > Settings > Enable 'Confirm email'"
      ] : [
        "Email confirmation is enabled but emails may not be delivering",
        "Check Supabase Dashboard > Authentication > Settings for email templates",
        "Verify SMTP configuration is working",
        "Check email provider (Resend) for delivery logs"
      ],
      supabase_auth_settings_url: `https://supabase.com/dashboard/project/${supabaseUrl.split('.')[0].split('//')[1]}/auth/settings`
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check email verification settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
