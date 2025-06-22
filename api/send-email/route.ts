import { NextResponse } from 'next/server';
import { sendEmail, isEmailConfigured } from '@/lib/resend/client';
import { welcomeEmailTemplate, passwordResetEmailTemplate, magicLinkEmailTemplate } from '@/lib/resend/templates';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, email, name, url, ...params } = body;
    
    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required' 
      }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ 
        error: 'Email type is required (welcome, password-reset, magic-link)' 
      }, { status: 400 });
    }

    if (!url) {
      return NextResponse.json({ 
        error: 'URL is required for email action' 
      }, { status: 400 });
    }

    // Check if email service is configured
    if (!isEmailConfigured()) {
      return NextResponse.json({ 
        error: 'Email service not configured. Please set RESEND_KEY environment variable.',
        debug: {
          resend_configured: false,
          email_type: type,
          recipient: email
        }
      }, { status: 503 });
    }

    let emailData;
    
    // Generate email based on type
    switch (type) {
      case 'welcome':
        emailData = welcomeEmailTemplate({
          name,
          confirmationUrl: url,
          email
        });
        break;
        
      case 'password-reset':
        emailData = passwordResetEmailTemplate({
          name,
          resetUrl: url,
          email
        });
        break;
        
      case 'magic-link':
        emailData = magicLinkEmailTemplate({
          name,
          magicUrl: url,
          email
        });
        break;
        
      default:
        return NextResponse.json({ 
          error: `Unknown email type: ${type}. Supported types: welcome, password-reset, magic-link` 
        }, { status: 400 });
    }

    // Send email
    const result = await sendEmail({
      to: email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    });

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Failed to send email',
        details: result.error
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: `${type} email sent successfully`,
      email_id: result.data?.id,
      recipient: email
    });

  } catch (error) {
    console.error('Send email API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  const isConfigured = isEmailConfigured();
  
  return NextResponse.json({ 
    message: 'Send Email API endpoint',
    configured: isConfigured,
    usage: {
      method: 'POST',
      body: {
        type: 'welcome | password-reset | magic-link',
        email: 'recipient@example.com',
        name: 'Optional name',
        url: 'Action URL (confirmation/reset/magic link)'
      }
    },
    example: {
      welcome: {
        type: 'welcome',
        email: 'user@example.com',
        name: 'John Doe',
        url: 'https://yourapp.com/auth/callback?token=...'
      },
      'password-reset': {
        type: 'password-reset',
        email: 'user@example.com',
        name: 'John Doe',
        url: 'https://yourapp.com/reset-password?token=...'
      }
    }
  });
}
