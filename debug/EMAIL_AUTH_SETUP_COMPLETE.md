# 🔐 Email Authentication Setup & Configuration Guide

## 📋 Complete Configuration Checklist

### ✅ 1. Resend Email Service Setup

#### 1.1 Create Resend Account

- [ ] Sign up at https://resend.com
- [ ] Verify your account via email
- [ ] Complete onboarding

#### 1.2 Domain Configuration (Recommended for Production)

- [ ] Add your domain to Resend dashboard
- [ ] Add DNS records (SPF, DKIM, DMARC) to your domain
- [ ] Verify domain in Resend dashboard
- [ ] OR use Resend's sandbox domain for testing

#### 1.3 API Key Creation

- [ ] Go to https://resend.com/api-keys
- [ ] Create new API key with descriptive name
- [ ] Copy the API key (starts with `re_`)
- [ ] Add to `.env.local`: `RESEND_KEY=re_your_actual_key_here`

### ✅ 2. Environment Variables Configuration

Update your `.env.local` file with these variables:

```bash
# Supabase Configuration (Already set)
NEXT_PUBLIC_SUPABASE_URL=https://ywfjmsbyksehjgwalqum.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration (Already set)
NEXT_PUBLIC_APP_URL=https://djmixandmingle.com

# Email Service Configuration (UPDATE THIS)
RESEND_KEY=re_your_actual_key_here  # ← Replace placeholder

# Optional: Email Configuration
RESEND_FROM_EMAIL=Mix & Mingle <noreply@djmixandmingle.com>
RESEND_REPLY_TO=support@djmixandmingle.com
```

#### Current Status Check:

- [x] Supabase URL configured
- [x] Supabase keys configured
- [x] App URL configured
- [ ] **RESEND_KEY needs real API key**

### ✅ 3. Supabase Auth Configuration

#### 3.1 Authentication Settings

- [ ] Go to Supabase Dashboard → Authentication → Settings
- [ ] Enable "Email confirmations"
- [ ] Set "Confirm email" to ON
- [ ] Configure redirect URLs:
  - Production: `https://djmixandmingle.com/auth/callback`
  - Development: `http://localhost:3000/auth/callback`

#### 3.2 Email Templates (Optional - Custom Templates)

- [ ] Go to Authentication → Email Templates
- [ ] Customize "Confirm your signup" template
- [ ] Customize "Reset your password" template
- [ ] Preview and test templates

#### 3.3 SMTP Configuration (For Custom Email Provider)

- [ ] Go to Authentication → Settings → SMTP Settings
- [ ] Enable "Enable custom SMTP"
- [ ] Configure Resend SMTP:
  - Host: `smtp.resend.com`
  - Port: `587` or `465`
  - Username: `resend`
  - Password: Your Resend API key
  - Sender name: `Mix & Mingle`
  - Sender email: `noreply@djmixandmingle.com`

### ✅ 4. Application Files Status

#### 4.1 Email Infrastructure ✅

- [x] `/lib/resend/client.ts` - Resend client configuration
- [x] `/lib/resend/templates.ts` - Professional email templates
- [x] `/app/api/send-email/route.ts` - Email sending API
- [x] `/app/api/test-email/route.ts` - Email testing endpoint

#### 4.2 Authentication APIs ✅

- [x] `/app/api/auth/signup/route.ts` - Enhanced with email integration
- [x] `/app/api/auth/reset-password/route.ts` - Enhanced with Resend fallback
- [x] `/app/api/auth/callback/route.ts` - Email confirmation handler
- [x] `/app/api/auth/user/route.ts` - User session management

#### 4.3 Required Dependencies ✅

- [x] `resend@^4.6.0` installed in package.json
- [x] `@supabase/supabase-js` configured
- [x] TypeScript types configured

### ✅ 5. Testing & Validation Script

Run these tests in order to validate your setup:

#### 5.1 Test Email Service Configuration

```bash
# Test 1: Check email service status
curl -X GET http://localhost:3000/api/test-email

# Test 2: Send test email (replace with your email)
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

#### 5.2 Test Sign-up Flow

```bash
# Test user registration with email confirmation
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "metadata": {"username": "testuser"}
  }'
```

#### 5.3 Test Password Reset Flow

```bash
# Test password reset email
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### ✅ 6. Security Configuration

#### 6.1 Rate Limiting (Recommended)

Add to your API routes:

```typescript
// Simple rate limiting example
const rateLimitMap = new Map();
const RATE_LIMIT = 5; // 5 emails per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  const recentRequests = userRequests.filter(
    (time: number) => now - time < RATE_WINDOW,
  );

  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }

  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}
```

#### 6.2 Email Validation

- [x] Email format validation implemented
- [x] Password strength validation (min 8 characters)
- [x] Security-focused error messages (don't reveal user existence)

#### 6.3 HTTPS & Security Headers

Ensure these headers in your production deployment:

```typescript
// Add to middleware.ts or API routes
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https:;"
}
```

### ✅ 7. Monitoring & Analytics

#### 7.1 Resend Dashboard Monitoring

- [ ] Check delivery rates at https://resend.com/dashboard
- [ ] Monitor bounce and complaint rates
- [ ] Set up alerts for delivery issues

#### 7.2 Application Logging

- [x] Email sending attempts logged
- [x] Error tracking implemented
- [x] Success/failure metrics captured

### ✅ 8. Production Deployment Checklist

#### 8.1 Environment Variables

- [ ] RESEND_KEY updated with production API key
- [ ] NEXT_PUBLIC_APP_URL set to production domain
- [ ] All Supabase keys verified for production project

#### 8.2 Domain & DNS

- [ ] Custom domain configured in Resend
- [ ] SPF record: `"v=spf1 include:_spf.resend.com ~all"`
- [ ] DKIM record added (provided by Resend)
- [ ] DMARC policy configured

#### 8.3 Testing in Production

- [ ] Test signup flow with real email
- [ ] Test password reset with real email
- [ ] Verify email delivery to common providers (Gmail, Outlook, etc.)
- [ ] Check spam folder placement

### 🚀 Quick Start Commands

#### Start Development Server

```bash
npm run dev
```

#### Test Email Configuration

```bash
# Test if Resend is configured
node -e "console.log(process.env.RESEND_KEY ? 'RESEND_KEY is set' : 'RESEND_KEY not configured')"

# Test email sending
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

#### Build for Production

```bash
npm run build
npm start
```

## 🔧 Troubleshooting Common Issues

### Issue: "Email service not configured"

**Solution:** Update RESEND_KEY in .env.local with real API key from Resend dashboard

### Issue: Emails not delivering

**Solutions:**

1. Check Resend dashboard for delivery logs
2. Verify sender domain is configured
3. Check recipient's spam folder
4. Ensure SPF/DKIM records are set

### Issue: Supabase auth errors

**Solutions:**

1. Verify SUPABASE_SERVICE_ROLE_KEY is correct
2. Check Supabase project settings
3. Ensure auth is enabled in Supabase dashboard

### Issue: CORS errors in browser

**Solution:** Add your domain to Supabase allowed origins

## 📞 Support & Next Steps

1. **Complete the RESEND_KEY setup** - This is the only missing piece
2. **Test the email flows** - Use the provided curl commands
3. **Configure your domain** - For professional email delivery
4. **Monitor delivery rates** - Keep an eye on the Resend dashboard

Once RESEND_KEY is configured, your email authentication system will be fully operational!

## 🎯 Success Metrics

Your setup is complete when:

- [ ] Test emails deliver successfully
- [ ] Signup confirmation emails work
- [ ] Password reset emails work
- [ ] No errors in application logs
- [ ] 95%+ delivery rate in Resend dashboard
