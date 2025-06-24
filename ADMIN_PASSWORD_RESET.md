# 🔑 ADMIN PASSWORD RESET OPTIONS

## Option 1: Reset via Your App (Recommended)

### 🚀 If your app is running locally:
1. Go to: `http://localhost:3000/auth/forgot-password`
2. Enter: `larrybesant@gmail.com`
3. Check your email for reset link
4. Follow the link to set new password
5. Then login and access admin at: `http://localhost:3000/admin`

### 🌐 If using deployed app:
1. Go to: `https://your-app.vercel.app/auth/forgot-password`
2. Enter: `larrybesant@gmail.com`
3. Check your email for reset link
4. Follow the link to set new password
5. Then login and access admin

## Option 2: Reset via Supabase Dashboard

### 📊 Direct Supabase Method:
1. Go to: `https://supabase.com/dashboard`
2. Login to your Supabase account
3. Select your project: `ywfjmsbyksehjgwalqum`
4. Go to **Authentication** → **Users**
5. Find user: `larrybesant@gmail.com`
6. Click the **"..."** menu → **"Send password reset"**
7. Check your email and follow the reset link

## Option 3: Quick Local Reset (Fastest)

### ⚡ Create new admin account locally:
1. Go to: `http://localhost:3000/auth/signup`
2. Use email: `larrybesant@gmail.com`
3. Create a new password
4. Check email and verify if needed
5. Login and access: `http://localhost:3000/admin`

## 🎯 After Password Reset:

### ✅ Test Admin Access:
1. Login with: `larrybesant@gmail.com` + new password
2. Visit: `/admin` 
3. You should see the admin dashboard
4. Test creating communities, managing users, etc.

### 🔧 For Production Deployment:
- Your new password will work on both local and deployed versions
- The admin email (`larrybesant@gmail.com`) is set in environment variables
- Once logged in, you automatically get admin access

## 🚨 Important Notes:

- **Admin access is tied to your email**: `larrybesant@gmail.com`
- **No separate admin password**: Uses your regular Supabase account password
- **Automatic admin recognition**: The app checks your email and grants admin access
- **Works everywhere**: Local development, production deployment, etc.

## 🚀 Recommended Action:

**Use Option 1** - go to your forgot password page and reset via email. This is the most secure and straightforward method.
