# Safety System Database Setup Guide

## 🚀 Quick Setup Instructions

### Option 1: Automatic Setup (Recommended)

```bash
node setup-safety-database.js
```

### Option 2: Manual Setup (If automatic fails)

1. **Go to your Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy the Schema**
   - Open `database/safety-schema.sql` in your editor
   - Copy all the contents

4. **Run the Schema**
   - Paste the SQL into the Supabase SQL Editor
   - Click "Run" to execute the script

5. **Verify Tables Created**
   - Go to "Table Editor" in the sidebar
   - Verify these tables exist:
     - `community_reports`
     - `moderation_actions`
     - `user_moderation`
     - `guidelines_acceptance`
     - `age_verification`
     - `user_trust_scores`
     - `safety_incidents`
     - `emergency_contacts`

## 🧪 Test Your Setup

After setting up the database, test it:

```bash
# Test the safety system
node test-safety-system.js

# Start your app
npm run dev

# Visit the safety center
# http://localhost:3000/safety
```

## 🔧 Troubleshooting

### Common Issues:

**1. Permission Errors**

- Ensure you're using the service role key, not the anon key
- Check that RLS policies are properly configured

**2. Table Already Exists**

- The script uses `CREATE TABLE IF NOT EXISTS`
- This is safe to run multiple times

**3. Function Creation Fails**

- Some Supabase instances may not allow function creation via API
- Run the SQL manually in the dashboard

**4. Environment Variables Missing**

```bash
# Check your .env.local file has:
NEXT_PUBLIC_SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Manual SQL Steps:

If the automatic setup completely fails, run these SQL commands one by one in your Supabase dashboard:

```sql
-- 1. Create the core tables
CREATE TABLE IF NOT EXISTS community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_content_id UUID,
  content_type TEXT,
  report_type TEXT NOT NULL CHECK (report_type IN ('harassment', 'hate_speech', 'bullying', 'threats', 'inappropriate_content', 'spam', 'fake_profile', 'underage', 'copyright', 'other')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'escalated', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
CREATE POLICY "Users can view their own reports" ON community_reports
  FOR SELECT USING (auth.uid() = reporter_id OR auth.uid() = reported_user_id);

CREATE POLICY "Users can create reports" ON community_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);
```

Continue with the rest of the tables following the same pattern.

## ✅ Verification

Once setup is complete, you should see:

1. **8 new tables** in your Supabase Table Editor
2. **RLS policies** enabled on safety tables
3. **Indexes** created for performance
4. **Functions and triggers** for trust score updates

## 🎯 Next Steps

After successful database setup:

1. **Test the APIs**: Use the test script to verify endpoints
2. **Test the UI**: Visit `/safety` to see the Safety Center
3. **Try reporting**: Test the report submission flow
4. **Test moderation**: Try blocking/muting users
5. **Age verification**: Test the age verification process

## 🚨 Important Notes

- **Backup first**: Always backup your database before running new schemas
- **Production**: Test thoroughly in development before deploying to production
- **Privacy**: The system stores sensitive data - ensure proper security measures
- **Legal**: Consult with legal counsel about compliance requirements
- **Monitoring**: Set up monitoring for the safety system in production

Your safety system is now ready to protect your community! 🛡️
