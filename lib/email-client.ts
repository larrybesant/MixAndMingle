import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface EmailResult {
  success: boolean;
  provider: 'resend' | 'supabase';
  id?: string;
  error?: string;
}

class EmailService {
  private resend: Resend | null = null;
  private supabase: any;

  constructor() {
    // Initialize Resend if API key exists and is not placeholder
    const resendKey = process.env.RESEND_KEY;
    if (resendKey && !resendKey.includes('xxx') && resendKey.startsWith('re_')) {
      this.resend = new Resend(resendKey);
      console.log('✅ Resend initialized successfully');
    } else {
      console.log('⚠️ Resend not initialized - API key missing or invalid');
    }

    // Initialize Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      console.log('✅ Supabase initialized successfully');
    } else {
      console.log('❌ Supabase not initialized - missing credentials');
    }
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    const { to, subject, html, from } = options;

    // Try Resend first (if configured)
    if (this.resend) {
      try {
        const result = await this.resend.emails.send({
          from: from || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: [to],
          subject,
          html,
        });
          console.log('✅ Email sent via Resend:', result.data?.id || 'success');
        return { success: true, provider: 'resend', id: result.data?.id };
      } catch (error: any) {
        console.log('❌ Resend failed:', error.message);
        
        // If domain not verified, provide helpful message
        if (error.message?.includes('domain')) {
          console.log('💡 Domain verification needed. Using onboarding@resend.dev for now.');
          try {
            const fallbackResult = await this.resend.emails.send({
              from: 'onboarding@resend.dev',
              to: [to],
              subject,
              html,
            });
            return { success: true, provider: 'resend', id: fallbackResult.data?.id };
          } catch (fallbackError: any) {
            console.log('❌ Resend fallback also failed:', fallbackError.message);
          }
        }
      }
    }

    // Fallback to Supabase (for password reset only)
    if (this.supabase && subject.toLowerCase().includes('password')) {
      try {
        const { error } = await this.supabase.auth.resetPasswordForEmail(to, {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
        });
        
        if (!error) {
          console.log('✅ Password reset sent via Supabase');
          return { success: true, provider: 'supabase' };
        } else {
          console.log('❌ Supabase error:', error.message);
        }
      } catch (error: any) {
        console.log('❌ Supabase fallback failed:', error.message);
      }
    }

    // If all providers fail, return error
    const errorMsg = 'All email providers failed. Check Resend API key and Supabase configuration.';
    console.log('❌', errorMsg);
    return { success: false, provider: 'resend', error: errorMsg };
  }

  async sendSignupConfirmation(email: string, confirmUrl: string): Promise<EmailResult> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    return this.sendEmail({
      to: email,
      subject: 'Welcome to DJ Mix & Mingle - Confirm Your Email',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to DJ Mix & Mingle</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 40px 0;">
            <h1 style="color: #8B5CF6; margin-bottom: 10px;">🎵 Welcome to DJ Mix & Mingle!</h1>
            <p style="font-size: 18px; color: #666; margin-bottom: 30px;">
              Thanks for signing up! Let's get your account verified.
            </p>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin: 30px 0;">
              <p style="margin-bottom: 20px; color: #333;">
                Click the button below to confirm your email address:
              </p>
              <a href="${confirmUrl}" 
                 style="background: #8B5CF6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Confirm Email Address
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, copy and paste this URL into your browser:<br>
              <a href="${confirmUrl}" style="color: #8B5CF6; word-break: break-all;">${confirmUrl}</a>
            </p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="color: #999; font-size: 12px;">
              This email was sent to ${email}. If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendPasswordReset(email: string, resetUrl: string): Promise<EmailResult> {
    return this.sendEmail({
      to: email,
      subject: 'DJ Mix & Mingle - Reset Your Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 40px 0;">
            <h1 style="color: #EF4444; margin-bottom: 10px;">🔒 Reset Your Password</h1>
            <p style="font-size: 18px; color: #666; margin-bottom: 30px;">
              We received a request to reset your password.
            </p>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin: 30px 0;">
              <p style="margin-bottom: 20px; color: #333;">
                Click the button below to create a new password:
              </p>
              <a href="${resetUrl}" 
                 style="background: #EF4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, copy and paste this URL into your browser:<br>
              <a href="${resetUrl}" style="color: #EF4444; word-break: break-all;">${resetUrl}</a>
            </p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 30px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>Security Note:</strong> This link will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.
              </p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="color: #999; font-size: 12px;">
              This email was sent to ${email} from DJ Mix & Mingle.
            </p>
          </div>
        </body>
        </html>
      `,
    });
  }

  // Test email function
  async sendTestEmail(email: string): Promise<EmailResult> {
    return this.sendEmail({
      to: email,
      subject: 'Test Email from DJ Mix & Mingle',
      html: `
        <h1>🎉 Email Test Successful!</h1>
        <p>This is a test email to verify your email configuration is working correctly.</p>
        <p><strong>Provider:</strong> ${this.resend ? 'Resend' : 'Supabase'}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p>If you received this email, your email system is working! 🚀</p>
      `,
    });
  }

  // Get configuration status
  getStatus() {
    return {
      resend: {
        configured: !!this.resend,
        apiKey: process.env.RESEND_KEY ? 
          (process.env.RESEND_KEY.includes('xxx') ? 'placeholder' : 'set') : 'missing'
      },
      supabase: {
        configured: !!this.supabase,
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    };
  }
}

export const emailService = new EmailService();
