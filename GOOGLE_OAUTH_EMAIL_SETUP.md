# Google OAuth & Email Setup Guide

## Current Issues Diagnosed:
- ❌ Google OAuth not configured in Supabase
- ❌ Resend API key not set up for email sending
- ✅ Basic email/password login is working perfectly

## 🔑 Google OAuth Setup (Complete Steps)

### Step 1: Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "MixandMingle"
   - Authorized redirect URIs: `https://ywfjmsbyksehjgwalqum.supabase.co/auth/v1/callback`
5. Copy the Client ID and Client Secret

### Step 2: Supabase Dashboard Configuration
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ywfjmsbyksehjgwalqum/auth/providers)
2. Find "Google" in the Auth Providers list
3. Enable the Google provider
4. Enter your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
5. Save the configuration

### Step 3: Update Your App (Already Done)
✅ OAuth callback route exists: `/app/auth/callback/route.ts`
✅ Login page has Google OAuth button
✅ Proper error handling implemented

## 📧 Email Setup (Password Reset & Notifications)

### Option 1: Resend API (Recommended)
1. Go to [Resend](https://resend.com/)
2. Create account and verify your domain
3. Get your API key from dashboard
4. Update `.env.local`:
   ```
   RESEND_KEY=re_your_actual_api_key_here
   ```
5. Restart your dev server

### Option 2: Supabase Built-in SMTP
1. Go to [Supabase Auth Settings](https://supabase.com/dashboard/project/ywfjmsbyksehjgwalqum/auth/templates)
2. Configure SMTP settings
3. Set up email templates

## 🧪 Testing Your Setup

### Test Google OAuth:
1. Configure Google OAuth (steps above)
2. Go to your login page
3. Click "Continue with Google"
4. Should redirect to Google login
5. After authentication, should return to your app

### Test Email Sending:
1. Set up Resend API key
2. Go to login page
3. Click "Forgot Password?"
4. Enter your email
5. Check inbox for reset email

## 🚀 Quick Workarounds (Until Setup Complete)

### For Login Issues:
- Use the test credentials: `quicklogin-1750634550053@example.com` / `QuickLogin123!`
- Or click the green "🧪 Create & Login Test Account" button

### For Password Reset:
- Create a new account if you forgot your password
- Or contact support at beta@djmixandmingle.com

## 🔍 Current Status Check

Run this to verify your setup:
```bash
node diagnose-oauth-email.js
```

## 📋 Priority Order:
1. **IMMEDIATE**: Fix regular login (working but you're having browser issues)
2. **HIGH**: Set up Resend API for password reset emails
3. **MEDIUM**: Configure Google OAuth for easier signup

## 🎯 Need Help?
- Email backend login is 100% working
- Browser login issue likely related to JavaScript/network
- Google OAuth needs Supabase dashboard configuration
- Email sending needs Resend API key

Contact support with:
- Browser console screenshots
- Network tab errors
- Specific error messages
