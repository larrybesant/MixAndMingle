# 🔑 Google Sign-In Setup Guide

## Current Status: ✅ CODE READY - NEEDS SUPABASE CONFIGURATION

Your Google OAuth code is already implemented! You just need to configure it in Supabase and Google Console.

## 📋 Setup Steps

### 1. Google Cloud Console Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**: Create a new project or select existing one
3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "Mix and Mingle App"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://your-production-domain.com` (for production)
   - Authorized redirect URIs:
     - `https://ywfjmsbyksehjgwalqum.supabase.co/auth/v1/callback`

### 2. Supabase Dashboard Configuration

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/ywfjmsbyksehjgwalqum
2. **Navigate to Authentication > Providers**
3. **Enable Google Provider**:
   - Toggle "Enable sign in with Google" to ON
   - Add your Google Client ID
   - Add your Google Client Secret
4. **Configure Redirect URLs** (if not already set):
   - Site URL: `http://localhost:3000` (development)
   - Redirect URLs: `http://localhost:3000/auth/callback`

### 3. Environment Variables

Add to your `.env.local` file:
```bash
# Google OAuth (from Google Cloud Console)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 🧪 Testing Google Sign-In

### Current Implementation
Your app already has Google OAuth buttons in:
- Login page (`/components/auth/login-form.tsx`)
- Signup page (`/components/auth/signup-form.tsx`)

### Test Flow
1. Click "Sign in with Google" button
2. User is redirected to Google OAuth
3. After authorization, redirected to `/auth/callback`
4. Callback processes the session
5. User is redirected to dashboard or profile creation

## 🔧 Code Structure (Already Implemented)

### OAuth Client (`lib/supabase/client.ts`)
```typescript
signInWithOAuth: async (provider: 'google' | 'github' | 'discord') => {
  return await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: \`\${window.location.origin}/auth/callback\`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
}
```

### Auth Context (`contexts/auth-context.tsx`)
```typescript
const signInWithOAuth = async (provider: 'google' | 'github' | 'discord') => {
  // OAuth handling logic
}
```

### Callback Handler (`app/auth/callback/page.tsx`)
```typescript
const handleAuthCallback = async () => {
  // Process OAuth callback and redirect
}
```

## 🎨 UI Components (Already Built)

### Google Button in Login Form
```tsx
<Button
  type="button"
  variant="outline"
  className="w-full"
  onClick={() => handleOAuthSignIn('google')}
  disabled={isLoading}
>
  <FcGoogle className="w-5 h-5 mr-2" />
  Continue with Google
</Button>
```

## 🚨 Quick Setup Commands

### Test Current OAuth Status
```bash
# Check if OAuth endpoint is working
curl http://localhost:3000/api/email-config-check

# Test login page (should show Google button)
curl http://localhost:3000/login
```

## 🔍 Debugging Google OAuth

### Common Issues & Solutions

1. **"OAuth Error" on redirect**
   - Check Supabase redirect URLs
   - Verify Google OAuth credentials

2. **"Invalid Client" error**
   - Verify Google Client ID in Supabase
   - Check authorized domains in Google Console

3. **Redirect loop**
   - Check callback URL configuration
   - Verify environment variables

### Debug Endpoints
```bash
# Check auth configuration
GET /api/email-config-check

# Check current user session
GET /api/auth/user
```

## 📊 Expected Flow

1. **User clicks "Sign in with Google"**
2. **Redirected to Google OAuth** (`accounts.google.com`)
3. **User authorizes app**
4. **Google redirects to Supabase** (`supabase.co/auth/v1/callback`)
5. **Supabase redirects to app** (`your-app.com/auth/callback`)
6. **App processes session** and redirects to dashboard

## ✅ Final Steps

1. **Configure Google Cloud Console** (get Client ID & Secret)
2. **Add credentials to Supabase Dashboard**
3. **Test Google Sign-In button**
4. **Verify user profile creation flow**

## 🎉 Benefits

- **Faster signup**: No password required
- **Better UX**: One-click authentication
- **Secure**: Google handles password security
- **Profile data**: Get user's name, email, avatar from Google

---

**Status**: ✅ Code implemented, needs Supabase + Google Console configuration
**Time to complete**: ~15 minutes
**Next step**: Configure Google Cloud Console credentials
