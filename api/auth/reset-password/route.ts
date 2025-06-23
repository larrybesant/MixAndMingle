import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { emailService } from '@/lib/email-client';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Please enter a valid email address' 
      }, { status: 400 });
    }

    console.log('🔧 Processing password reset request for:', email);

    // Create Supabase clients
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!serviceRoleKey || !anonKey) {
      return NextResponse.json({ 
        error: 'Supabase configuration missing' 
      }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    
    // First, check if user exists (using service role for admin access)
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error('User lookup error:', userError);
      // Return success message anyway for security (don't reveal if user exists)
      return NextResponse.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.',
        email_sent: false,
        reason: 'User lookup failed'
      });
    }

    const userExists = users.users.find(user => user.email === email);
    
    if (!userExists) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.',
        email_sent: false,
        reason: 'User not found'
      });
    }

    let resetLinkSent = false;
    let customEmailSent = false;
    let resetUrl = '';

    // Method 1: Try Supabase built-in password reset
    const supabaseClient = createClient(supabaseUrl, anonKey);
    const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
    });

    if (!resetError) {
      console.log('✅ Supabase password reset email sent successfully');
      resetLinkSent = true;    } else {
      console.log('⚠️ Supabase password reset failed:', resetError.message);
      
      // Method 2: Generate admin reset link and send custom email
      const emailStatus = emailService.getStatus();
      
      if (emailStatus.resend.configured || emailStatus.supabase.configured) {
        try {
          const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: email,
            options: {
              redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
            }
          });

          if (!linkError && linkData.properties?.action_link) {
            resetUrl = linkData.properties.action_link;
            
            // Send custom email with our email service
            const emailResult = await emailService.sendPasswordReset(email, resetUrl);

            if (emailResult.success) {
              console.log(`✅ Custom password reset email sent via ${emailResult.provider}`);
              customEmailSent = true;
            } else {
              console.error('❌ Failed to send custom password reset email:', emailResult.error);
            }
          }
        } catch (adminError) {
          console.error('❌ Admin link generation failed:', adminError);
        }
      }
    }

    // Return appropriate response
    if (resetLinkSent || customEmailSent) {
      return NextResponse.json({ 
        message: 'Password reset email sent successfully. Please check your inbox and spam folder.',
        email_sent: true,
        method: resetLinkSent ? 'supabase_builtin' : 'custom_resend',
        next_steps: [
          'Check your email inbox',
          'Look in spam/junk folder if needed',
          'Click the reset link within 1 hour',
          'Create a new strong password'
        ]
      });
    } else {
      // Provide fallback with direct link if available
      if (resetUrl) {
        return NextResponse.json({ 
          message: 'Email service not fully configured. Here is your direct reset link:',
          reset_link: resetUrl,
          email_sent: false,
          instructions: [
            '1. Copy the reset link above',
            '2. Paste it in your browser to reset your password',
            '3. Link expires in 1 hour for security'
          ],
          warning: 'For security, this link should not be shared with anyone.'
        });
      } else {
        return NextResponse.json({ 
          message: 'Password reset request processed, but email delivery may be delayed.',
          email_sent: false,
          troubleshooting: [
            'Check if RESEND_KEY is configured',
            'Verify Supabase email settings',
            'Contact support if issues persist'
          ]
        });
      }
    }

  } catch (error) {
    console.error('Password reset API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Password Reset API endpoint',
    usage: 'POST with { email: "user@example.com" }',
    features: [
      'Validates email format',
      'Checks if user exists (securely)',
      'Attempts Supabase built-in reset first',
      'Falls back to custom Resend email',
      'Provides direct link if email fails'
    ]
  });
}
