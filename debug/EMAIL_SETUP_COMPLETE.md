# 🚀 COMPLETE EMAIL AUTHENTICATION SETUP GUIDE

## Current Status Analysis

Based on your project analysis:

- ✅ **Supabase**: Configured with valid credentials
- ✅ **Resend**: Package installed but API key is placeholder
- ❌ **Email Delivery**: Not working reliably (tested in previous sessions)

## Recommended Solution: Hybrid Approach

Use **Resend as primary** with **Supabase as fallback** for maximum reliability.

---

## 🎯 QUICK SETUP (Recommended Path)

### Step 1: Get Resend API Key

1. Go to [resend.com/api-keys](https://resend.com/api-keys)
2. Create account if needed
3. Generate API key
4. Copy the key (starts with `re_`)

### Step 2: Update Environment Variables

```bash
# Replace in .env.local
RESEND_KEY=re_your_actual_api_key_here

# Add these if missing
RESEND_FROM_EMAIL=onboarding@yourdomain.com
RESEND_FROM_NAME=DJ Mix & Mingle
```

### Step 3: Quick Test Script

Run this to test email delivery:

```bash
node -e "
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_KEY);

resend.emails.send({
  from: 'onboarding@resend.dev',
  to: ['your-email@gmail.com'],
  subject: 'Test Email from DJ Mix & Mingle',
  html: '<h1>Email works! 🎉</h1>'
}).then(console.log).catch(console.error);
"
```

---

## 📧 EMAIL DELIVERY OPTIONS

### Option A: Resend Only (Recommended)

- **Pros**: Reliable, fast, good analytics, 3,000 free emails/month
- **Cons**: Requires domain verification for production
- **Best for**: Production apps, reliable delivery

### Option B: Supabase Only

- **Pros**: Built-in, no extra service needed
- **Cons**: Limited customization, sometimes unreliable
- **Best for**: Simple apps, development only

### Option C: Hybrid (Our Implementation)

- **Pros**: Maximum reliability, graceful fallback
- **Cons**: Slightly more complex setup
- **Best for**: Critical applications

---

## 🔧 IMPLEMENTATION

### Updated Email Client (lib/email-client.ts)

```typescript
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

// Email client with fallback
class EmailService {
  private resend: Resend | null = null;
  private supabase: any;

  constructor() {
    // Initialize Resend if API key exists
    if (process.env.RESEND_KEY && !process.env.RESEND_KEY.includes("xxx")) {
      this.resend = new Resend(process.env.RESEND_KEY);
    }

    // Initialize Supabase
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }) {
    const { to, subject, html, from } = options;

    // Try Resend first (if configured)
    if (this.resend) {
      try {
        const result = await this.resend.emails.send({
          from:
            from || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          to: [to],
          subject,
          html,
        });

        console.log("✅ Email sent via Resend:", result.id);
        return { success: true, provider: "resend", id: result.id };
      } catch (error) {
        console.log("❌ Resend failed, trying Supabase fallback:", error);
      }
    }

    // Fallback to Supabase (for password reset only)
    if (subject.toLowerCase().includes("password")) {
      try {
        const { error } = await this.supabase.auth.resetPasswordForEmail(to, {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
        });

        if (!error) {
          console.log("✅ Password reset sent via Supabase");
          return { success: true, provider: "supabase" };
        }
      } catch (error) {
        console.log("❌ Supabase fallback failed:", error);
      }
    }

    throw new Error("All email providers failed");
  }

  async sendSignupConfirmation(email: string, confirmUrl: string) {
    return this.sendEmail({
      to: email,
      subject: "Welcome to DJ Mix & Mingle - Confirm Your Email",
      html: `
        <h1>Welcome to DJ Mix & Mingle! 🎵</h1>
        <p>Thanks for signing up! Click the link below to confirm your email:</p>
        <a href="${confirmUrl}" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Confirm Email
        </a>
        <p>If the button doesn't work, copy and paste this URL: ${confirmUrl}</p>
      `,
    });
  }

  async sendPasswordReset(email: string, resetUrl: string) {
    return this.sendEmail({
      to: email,
      subject: "DJ Mix & Mingle - Reset Your Password",
      html: `
        <h1>Reset Your Password</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Reset Password
        </a>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>If the button doesn't work, copy and paste this URL: ${resetUrl}</p>
      `,
    });
  }
}

export const emailService = new EmailService();
```

---

## 🧪 TESTING CHECKLIST

### 1. Environment Setup

```bash
# Check environment variables
node -e "console.log('Resend Key:', process.env.RESEND_KEY?.substring(0, 8) + '...');"
```

### 2. Test Email Delivery

```bash
# Test Resend (replace with your email)
node -e "
const { emailService } = require('./lib/email-client');
emailService.sendEmail({
  to: 'your-email@gmail.com',
  subject: 'Test Email',
  html: '<h1>Test successful! 🎉</h1>'
}).then(console.log).catch(console.error);
"
```

### 3. Test Authentication Flow

```bash
# Test signup (replace with your email)
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com","password":"testpass123"}'

# Test password reset (replace with your email)
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

---

## 🚨 TROUBLESHOOTING

### Resend Issues

- **Domain not verified**: Use `onboarding@resend.dev` for testing
- **API key invalid**: Get new key from Resend dashboard
- **Rate limited**: Check Resend dashboard for usage

### Supabase Issues

- **SMTP not configured**: Check Supabase dashboard > Authentication > Email
- **Rate limited**: Wait or use different email
- **Template issues**: Check Supabase email templates

### General Issues

- **Environment variables**: Restart Next.js after changing `.env.local`
- **Network issues**: Check firewall/proxy settings
- **Email not received**: Check spam folder, wait 5-10 minutes

---

## 🎯 PRODUCTION CHECKLIST

### Before Deploy:

- [ ] Real Resend API key added
- [ ] Domain verified in Resend dashboard
- [ ] Production URLs updated in Supabase dashboard
- [ ] Email templates customized
- [ ] Rate limiting configured
- [ ] Error monitoring setup (Sentry)

### After Deploy:

- [ ] Test signup flow end-to-end
- [ ] Test password reset flow end-to-end
- [ ] Monitor email delivery rates
- [ ] Check spam placement
- [ ] Verify email analytics

---

## 💡 NEXT STEPS

1. **Get Resend API key** and update `.env.local`
2. **Run the test script** to verify email delivery
3. **Test authentication flows** with real email address
4. **Monitor delivery** and adjust as needed

Would you like me to help you set up any specific part of this system?
