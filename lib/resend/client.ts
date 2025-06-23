import { Resend } from 'resend';

// Initialize Resend client
const resendApiKey = process.env.RESEND_KEY;

if (!resendApiKey || resendApiKey === 're_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
  console.warn('⚠️ RESEND_KEY not configured. Email functionality will be disabled.');
}

export const resend = resendApiKey && resendApiKey !== 're_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' 
  ? new Resend(resendApiKey) 
  : null;

// Email configuration
export const EMAIL_CONFIG = {
  // Use Resend's sandbox domain for testing until your domain is verified
  FROM_ADDRESS: process.env.NODE_ENV === 'production' 
    ? 'Mix & Mingle <noreply@djmixandmingle.com>'
    : 'Mix & Mingle <onboarding@resend.dev>',
  REPLY_TO: 'support@djmixandmingle.com',
  BRAND_NAME: 'Mix & Mingle',
  BASE_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

// Check if email service is configured
export function isEmailConfigured(): boolean {
  return resend !== null;
}

// Email sending wrapper with error handling
export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}) {
  if (!resend) {
    console.error('❌ Email service not configured. Cannot send email.');
    return {
      success: false,
      error: 'Email service not configured',
      data: null
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: params.from || EMAIL_CONFIG.FROM_ADDRESS,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo || EMAIL_CONFIG.REPLY_TO,
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      
      // Handle specific domain verification error
      if (error.message?.includes('domain is not verified')) {
        return {
          success: false,
          error: 'Domain not verified',
          details: error.message,
          solution: {
            message: 'Your domain needs to be verified with Resend',
            steps: [
              '1. Go to https://resend.com/domains',
              '2. Add your domain (djmixandmingle.com)',
              '3. Add the required DNS records',
              '4. Wait for verification',
              '5. For testing, use onboarding@resend.dev as sender'
            ],
            temporary_fix: 'Use onboarding@resend.dev as the from address for testing'
          },
          data: null
        };
      }
      
      return {
        success: false,
        error: error.message || 'Failed to send email',
        data: null
      };
    }

    console.log('✅ Email sent successfully:', data?.id);
    return {
      success: true,
      error: null,
      data
    };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}
