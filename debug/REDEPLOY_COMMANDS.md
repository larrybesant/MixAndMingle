# PowerShell Commands for Redeployment

## 1. Verify Current State

```powershell
# Check git status
git status

# Check current branch
git branch

# Check recent commits
git log --oneline -5
```

## 2. Build and Test Locally (Optional but Recommended)

```powershell
# Clean install dependencies
Remove-Item -Recurse -Force node_modules, .next -ErrorAction SilentlyContinue
npm install

# Run production build
npm run build

# Test production build locally
npm start
```

## 3. Push to GitHub (Triggers Auto-Deploy)

```powershell
# Add any remaining changes
git add .

# Commit if needed
git commit -m "Deploy theme consistency fixes and improvements"

# Push to main branch (triggers Vercel deployment)
git push origin main
```

## 4. Manual Vercel Deployment (Alternative)

```powershell
# Install Vercel CLI globally (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Or just deploy (preview first)
vercel
```

## 5. Check Deployment Status

```powershell
# Check Vercel deployments
vercel ls

# Get deployment URL
vercel inspect
```

## 6. Environment Variables (If Needed)

```powershell
# Set environment variables in Vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add RESEND_API_KEY

# Pull environment variables
vercel env pull .env.local
```

## 7. Domain Configuration (If Custom Domain)

```powershell
# Add custom domain
vercel domains add yourdomain.com

# List domains
vercel domains ls
```

## Quick Deploy (Most Common)

```powershell
# One-liner for quick deployment
git add . && git commit -m "Redeploy with fixes" && git push origin main
```

## Troubleshooting Commands

```powershell
# Check Vercel project settings
vercel inspect

# View deployment logs
vercel logs

# Reset Vercel project
vercel link

# Check build status
npm run build 2>&1 | Tee-Object build.log
```

## Post-Deployment Verification

```powershell
# Test the deployed app
Start-Process "https://your-app-url.vercel.app"

# Check specific pages
Start-Process "https://your-app-url.vercel.app/signup"
Start-Process "https://your-app-url.vercel.app/setup-profile"
```
