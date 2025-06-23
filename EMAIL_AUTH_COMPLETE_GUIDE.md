# 📧 Email Authentication Setup Guide
*Complete configuration for Supabase + Resend email authentication*

## ✅ SUPABASE AUTH CONFIGURATION

### 1. Enable Email Provider
In your Supabase Dashboard → Authentication → Providers:

```
✅ Email auth icon - ENABLED
✅ Enable Email provider - ENABLED
```

**Why**: This enables email/password signup and login for your application.

### 2. Email Confirmation Settings
```
✅ Confirm email - ENABLED (RECOMMENDED)
```

**What this does**: 
- Users must confirm their email before first login
- Prevents fake email registrations
- Ensures users have access to their email

**Alternative**: If disabled, users can login immediately without confirmation (less secure)

### 3. Secure Email Change
```
✅ Secure email change - ENABLED (RECOMMENDED)
```

**What this does**:
- Requires confirmation on BOTH old and new email addresses
- Prevents unauthorized email changes
- Protects against account takeover

**Alternative**: If disabled, only new email needs confirmation (less secure)

### 4. Secure Password Change
```
✅ Secure password change - ENABLED (RECOMMENDED)
```

**What this does**:
- Requires recent login (within 24 hours) to change password
- Prevents unauthorized password changes
- Forces re-authentication for sensitive actions

**Alternative**: If disabled, users can change password anytime (less secure)

## 🔧 RECOMMENDED SUPABASE SETTINGS

```yaml
Email Provider: ✅ ENABLED
Confirm email: ✅ ENABLED
Secure email change: ✅ ENABLED  
Secure password change: ✅ ENABLED
Double confirm email change: ✅ ENABLED
Enable email confirmations: ✅ ENABLED
```

## 📨 SUPABASE SMTP CONFIGURATION

### Option 1: Use Resend (RECOMMENDED)
In Supabase Dashboard → Settings → Auth:

```
SMTP Settings:
- Host: smtp.resend.com
- Port: 587
- Username: resend
- Password: [YOUR_RESEND_API_KEY]
- Sender name: Mix & Mingle
- Sender email: noreply@yourdomain.com
```

### Option 2: Custom SMTP
```
SMTP Settings:
- Host: [your-smtp-host]
- Port: 587 (or 465 for SSL)
- Username: [your-smtp-username]
- Password: [your-smtp-password]
- Sender name: Mix & Mingle
- Sender email: noreply@yourdomain.com
```

## 🌐 ENVIRONMENT VARIABLES

Update your `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ywfjmsbyksehjgwalqum.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
NEXT_PUBLIC_APP_URL=https://djmixandmingle.com

# Resend Configuration (Get from https://resend.com/api-keys)
RESEND_KEY=re_your_actual_api_key_here

# Optional: Twilio for SMS (if needed)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 📋 SETUP CHECKLIST

### Phase 1: Supabase Dashboard Setup
- [ ] Navigate to Supabase Dashboard → Authentication → Providers
- [ ] Enable Email provider
- [ ] Enable "Confirm email"
- [ ] Enable "Secure email change"
- [ ] Enable "Secure password change"
- [ ] Save configuration

### Phase 2: SMTP Configuration
- [ ] Go to Supabase Dashboard → Settings → Auth
- [ ] Configure SMTP settings (use Resend recommended)
- [ ] Test email sending from Supabase dashboard
- [ ] Verify email templates are working

### Phase 3: Resend Setup
- [ ] Sign up at https://resend.com
- [ ] Verify your domain (or use sandbox for testing)
- [ ] Generate API key
- [ ] Add API key to `.env.local`
- [ ] Test email sending via API

### Phase 4: Application Testing
- [ ] Restart your Next.js application
- [ ] Test signup flow with email confirmation
- [ ] Test password reset flow
- [ ] Test email change flow
- [ ] Verify all emails are delivered

## 🧪 TESTING COMMANDS

### Test Email Configuration
```bash
# Test Resend integration
curl -X POST http://localhost:3000/api/test-email \\
  -H "Content-Type: application/json" \\
  -d '{"email":"your-email@example.com"}'
```

### Test Signup Flow
```bash
# Test signup with email confirmation
curl -X POST http://localhost:3000/api/auth/signup \\
  -H "Content-Type: application/json" \\
  -d '{
    "email":"test@example.com",
    "password":"TestPassword123!",
    "metadata":{"name":"Test User"}
  }'
```

### Test Password Reset
```bash
# Test password reset flow
curl -X POST http://localhost:3000/api/auth/reset-password \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com"}'
```

## 📧 EMAIL TEMPLATES

Your system now includes:

### 1. Welcome/Confirmation Email
- Sent after signup
- Contains email confirmation link
- Branded with your app design

### 2. Password Reset Email
- Sent when user requests password reset
- Contains secure reset link (expires in 1 hour)
- Security warnings included

### 3. Magic Link Email (Optional)
- Passwordless login option
- One-click secure login
- Expires in 1 hour

## 🔒 SECURITY FEATURES

### Rate Limiting (Recommended)
Add to your API routes:
```typescript
// Limit password reset requests
const rateLimiter = new Map();
const RATE_LIMIT = 3; // requests per hour
const WINDOW = 60 * 60 * 1000; // 1 hour
```

### Headers Security
```typescript
// Add to your email API routes
const headers = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
};
```

## 🚨 TROUBLESHOOTING

### Common Issues:

1. **Emails not sending**
   - Check RESEND_KEY is valid
   - Verify domain is configured in Resend
   - Check Resend dashboard for delivery logs

2. **Email confirmation not working**
   - Verify Supabase redirect URLs
   - Check auth callback route exists
   - Ensure email confirmation is enabled

3. **Password reset failing**
   - Check Supabase SMTP settings
   - Verify reset page exists at /reset-password
   - Check for 405 hook errors

4. **Users can't login after signup**
   - Ensure email confirmation is enabled
   - Check if users are confirming emails
   - Verify auth flow in browser console

## 📊 MONITORING

### Resend Dashboard
Monitor:
- Email delivery rates
- Bounce rates
- Open rates
- Click rates

### Supabase Dashboard
Monitor:
- User signups
- Authentication errors
- Email confirmations
- Password resets

## 🚀 PRODUCTION DEPLOYMENT

Before going live:
- [ ] Configure custom domain for emails
- [ ] Set up proper DNS records (SPF, DKIM)
- [ ] Test email deliverability
- [ ] Set up monitoring alerts
- [ ] Configure backup SMTP provider
- [ ] Test all email flows in production

## 📞 SUPPORT

If you encounter issues:
1. Check browser console for errors
2. Review Resend dashboard logs
3. Check Supabase auth logs
4. Test with curl commands above
5. Use emergency access buttons for troubleshooting

---

*This guide ensures bulletproof email authentication for your Mix & Mingle application.*
