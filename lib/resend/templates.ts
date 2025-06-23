import { EMAIL_CONFIG } from './client';

// Base email template wrapper
function emailTemplate(content: string, title: string = EMAIL_CONFIG.BRAND_NAME): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 10px !important; }
      .header h1 { font-size: 32px !important; }
      .button { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #000000 0%, #4c1d95 50%, #000000 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div class="container" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <!-- Header -->
    <div class="header" style="text-align: center; padding: 40px 20px;">
      <h1 style="font-size: 42px; font-weight: 900; margin: 0; color: #ffffff;">
        <span style="color: #fb923c; text-shadow: 0 0 15px rgba(251, 146, 60, 0.8);">MIX</span>
        <span style="font-size: 48px; margin: 0 10px;">🎵</span>
        <span style="color: #22d3ee; text-shadow: 0 0 15px rgba(34, 211, 238, 0.8);">MINGLE</span>
      </h1>
    </div>

    <!-- Content -->
    <div style="background: rgba(255, 255, 255, 0.95); border-radius: 20px; padding: 40px; margin: 20px 0; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);">
      ${content}
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #a1a1aa; font-size: 14px;">
      <p style="margin: 0;">© 2024 ${EMAIL_CONFIG.BRAND_NAME}. All rights reserved.</p>
      <p style="margin: 10px 0 0 0;">
        <a href="${EMAIL_CONFIG.BASE_URL}/privacy" style="color: #22d3ee; text-decoration: none;">Privacy Policy</a> | 
        <a href="${EMAIL_CONFIG.BASE_URL}/terms" style="color: #22d3ee; text-decoration: none;">Terms of Service</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

// Button component for emails
function emailButton(text: string, url: string, style: 'primary' | 'secondary' = 'primary'): string {
  const backgroundColor = style === 'primary' ? '#3b82f6' : '#6b7280';
  return `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${url}" class="button" style="display: inline-block; background: ${backgroundColor}; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
        ${text}
      </a>
    </div>`;
}

// Welcome/Sign-up confirmation email
export function welcomeEmailTemplate(params: {
  name?: string;
  confirmationUrl: string;
  email: string;
}): { html: string; text: string; subject: string } {
  const name = params.name || 'Music Lover';
  
  const content = `
    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 28px;">Welcome to ${EMAIL_CONFIG.BRAND_NAME}! 🎉</h2>
    
    <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
      Hi ${name},
    </p>
    
    <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
      Thank you for joining ${EMAIL_CONFIG.BRAND_NAME}! We're excited to have you as part of our community where music lovers connect and share their passion.
    </p>
    
    <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 30px 0;">
      To get started, please confirm your email address by clicking the button below:
    </p>
    
    ${emailButton('Confirm Your Email', params.confirmationUrl)}
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="font-size: 14px; color: #6b7280; margin: 0;">
        <strong>What's next?</strong><br>
        • Complete your profile<br>
        • Discover music-loving friends<br>
        • Join live music rooms<br>
        • Share your favorite tracks
      </p>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin: 30px 0 0 0;">
      If you didn't create an account with us, you can safely ignore this email.
    </p>
  `;

  const text = `
Welcome to ${EMAIL_CONFIG.BRAND_NAME}!

Hi ${name},

Thank you for joining ${EMAIL_CONFIG.BRAND_NAME}! Please confirm your email address by visiting:
${params.confirmationUrl}

What's next?
• Complete your profile
• Discover music-loving friends  
• Join live music rooms
• Share your favorite tracks

If you didn't create an account with us, you can safely ignore this email.

Best regards,
The ${EMAIL_CONFIG.BRAND_NAME} Team
  `;

  return {
    html: emailTemplate(content, `Welcome to ${EMAIL_CONFIG.BRAND_NAME}`),
    text,
    subject: `🎵 Welcome to ${EMAIL_CONFIG.BRAND_NAME}! Please confirm your email`
  };
}

// Password reset email
export function passwordResetEmailTemplate(params: {
  name?: string;
  resetUrl: string;
  email: string;
}): { html: string; text: string; subject: string } {
  const name = params.name || 'User';
  
  const content = `
    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 28px;">Reset Your Password 🔐</h2>
    
    <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
      Hi ${name},
    </p>
    
    <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
      We received a request to reset the password for your ${EMAIL_CONFIG.BRAND_NAME} account associated with ${params.email}.
    </p>
    
    <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 30px 0;">
      Click the button below to reset your password:
    </p>
    
    ${emailButton('Reset Password', params.resetUrl)}
    
    <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="font-size: 14px; color: #92400e; margin: 0;">
        <strong>⚠️ Security Notice:</strong><br>
        This link will expire in 1 hour for security reasons.<br>
        If you didn't request this reset, please ignore this email.
      </p>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin: 30px 0 0 0;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${params.resetUrl}" style="color: #3b82f6; word-break: break-all;">${params.resetUrl}</a>
    </p>
  `;

  const text = `
Reset Your Password

Hi ${name},

We received a request to reset the password for your ${EMAIL_CONFIG.BRAND_NAME} account associated with ${params.email}.

Click this link to reset your password:
${params.resetUrl}

⚠️ Security Notice:
This link will expire in 1 hour for security reasons.
If you didn't request this reset, please ignore this email.

Best regards,
The ${EMAIL_CONFIG.BRAND_NAME} Team
  `;

  return {
    html: emailTemplate(content, 'Reset Your Password'),
    text,
    subject: `🔐 Reset your ${EMAIL_CONFIG.BRAND_NAME} password`
  };
}

// Magic link login email
export function magicLinkEmailTemplate(params: {
  name?: string;
  magicUrl: string;
  email: string;
}): { html: string; text: string; subject: string } {
  const name = params.name || 'User';
  
  const content = `
    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 28px;">Your Magic Login Link ✨</h2>
    
    <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
      Hi ${name},
    </p>
    
    <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
      Click the button below to securely sign in to your ${EMAIL_CONFIG.BRAND_NAME} account:
    </p>
    
    ${emailButton('Sign In to Your Account', params.magicUrl)}
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="font-size: 14px; color: #6b7280; margin: 0;">
        <strong>🔒 Secure Login:</strong><br>
        This link will sign you in automatically and expires in 1 hour.<br>
        No password required!
      </p>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin: 30px 0 0 0;">
      If you didn't request this login link, you can safely ignore this email.
    </p>
  `;

  const text = `
Your Magic Login Link

Hi ${name},

Click this link to securely sign in to your ${EMAIL_CONFIG.BRAND_NAME} account:
${params.magicUrl}

🔒 Secure Login:
This link will sign you in automatically and expires in 1 hour.
No password required!

If you didn't request this login link, you can safely ignore this email.

Best regards,
The ${EMAIL_CONFIG.BRAND_NAME} Team
  `;

  return {
    html: emailTemplate(content, 'Your Magic Login Link'),
    text,
    subject: `✨ Your ${EMAIL_CONFIG.BRAND_NAME} magic login link`
  };
}
