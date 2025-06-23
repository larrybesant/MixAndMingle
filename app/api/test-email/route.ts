import { NextResponse } from 'next/server';
import { sendEmail, isEmailConfigured } from '@/lib/resend/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required' 
      }, { status: 400 });
    }

    // Check if email service is configured
    if (!isEmailConfigured()) {
      return NextResponse.json({ 
        error: 'Email service not configured',
        details: 'RESEND_KEY environment variable is missing or invalid',
        instructions: [
          '1. Sign up at https://resend.com',
          '2. Create an API key',
          '3. Add RESEND_KEY=re_your_key_here to .env.local',
          '4. Restart your application'
        ]
      }, { status: 503 });
    }

    // Send test email
    const result = await sendEmail({
      to: email,
      subject: '🧪 Test Email from Mix & Mingle',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #3b82f6;">Test Email Successful! ✅</h1>
          <p>This is a test email from your Mix & Mingle application.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Recipient:</strong> ${email}</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937;">Email Service Status:</h3>
            <p style="margin: 0; color: #059669;">✅ Resend integration working correctly</p>
            <p style="margin: 5px 0 0 0; color: #059669;">✅ Email templates loading</p>
            <p style="margin: 5px 0 0 0; color: #059669;">✅ SMTP delivery functional</p>
          </div>
          
          <p>Your email authentication system is ready to use!</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 14px; color: #6b7280;">
            This is an automated test email from Mix & Mingle.<br>
            If you received this unexpectedly, you can safely ignore it.
          </p>
        </div>
      `,
      text: `
Test Email Successful!

This is a test email from your Mix & Mingle application.

Timestamp: ${new Date().toISOString()}
Recipient: ${email}

Email Service Status:
✅ Resend integration working correctly
✅ Email templates loading  
✅ SMTP delivery functional

Your email authentication system is ready to use!
      `
    });

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Failed to send test email',
        details: result.error,
        troubleshooting: [
          'Check if RESEND_KEY is valid',
          'Verify sender domain is configured in Resend',
          'Check Resend dashboard for delivery logs',
          'Ensure recipient email is valid'
        ]
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Test email sent successfully!',
      email_id: result.data?.id,
      recipient: email,
      next_steps: [
        'Check your inbox (and spam folder)',
        'Verify email templates are rendering correctly',
        'Test signup/password reset flows',
        'Monitor Resend dashboard for analytics'
      ]
    });

  } catch (error) {
    console.error('Test email API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  const isConfigured = isEmailConfigured();
  
  return NextResponse.json({ 
    message: 'Test Email API endpoint',
    configured: isConfigured,
    status: isConfigured ? 'Ready' : 'Not configured',
    usage: 'POST with { email: "test@example.com" }',
    setup_instructions: isConfigured ? null : [
      '1. Sign up at https://resend.com',
      '2. Verify your domain or use the sandbox',
      '3. Create an API key',
      '4. Add RESEND_KEY to your environment variables',
      '5. Restart the application'
    ]
  });
}
