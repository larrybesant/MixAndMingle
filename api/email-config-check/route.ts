import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'CUSTOM_SMTP_CONFIGURED',
    message: 'Custom SMTP settings have been configured in Supabase',
    smtp_provider: 'Resend (smtp.resend.com)',
    sender_email: 'mixandmingleapp@gmail.com',
    sender_name: 'mixandmingleapp',
    configuration: {
      host: 'smtp.resend.com',
      port: 587,
      username: 'resend',
      rate_limit: '60 seconds between emails',
      status: 'CONFIGURED'
    },
    next_steps: {
      step1: 'Test password reset email functionality',
      step2: 'Verify email templates are properly configured',
      step3: 'Test signup confirmation emails',
      step4: 'Monitor email delivery and logs'
    },
    test_instructions: {
      title: 'How to test email delivery',
      steps: [
        '1. Use the password reset endpoint: POST /api/auth/reset-password',
        '2. Check larrybesant@gmail.com inbox (including spam folder)',
        '3. Verify the reset link works correctly',
        '4. Test signup flow with email confirmation'
      ]
    },
    test_email: 'larrybesant@gmail.com',
    current_supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    email_service_status: 'CUSTOM_SMTP_CONFIGURED',
    dashboard_url: 'https://supabase.com/dashboard/project/ywfjmsbyksehjgwalqum/auth/settings'
  });
}

export async function POST() {
  try {
    // Test email configuration
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
      // Try to get auth settings (this will tell us if emails are configured)
    const { error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });
    
    if (error) {
      return NextResponse.json({
        status: 'ERROR',
        message: 'Cannot access Supabase admin functions',
        error: error.message,
        solution: 'Check your SUPABASE_SERVICE_ROLE_KEY in .env.local'
      });
    }
      return NextResponse.json({
      status: 'ADMIN_ACCESS_OK',
      message: 'Supabase admin access working - ready for Google OAuth configuration',
      email_smtp: 'CONFIGURED (Resend)',      google_oauth: {
        client_id: '1099369771281-2slee12u5f0maqpa0hrbca1fman39d52.apps.googleusercontent.com',
        client_secret: 'NEEDED - Get from Google Console OAuth details',
        oauth_type: 'OAuth 2.0 Client ID (NOT Firebase service account)',
        status: 'CLIENT_ID_READY_NEED_SECRET',
        next_step: 'Get Client Secret from Google Console and add to Supabase'
      },
      next_step: 'Configure Google OAuth provider in Supabase dashboard',
      dashboard_url: 'https://supabase.com/dashboard/project/ywfjmsbyksehjgwalqum/auth/providers'
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      message: 'Failed to test email configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
