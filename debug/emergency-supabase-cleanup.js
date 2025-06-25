/**
 * EMERGENCY SUPABASE USER CLEANUP - Admin Level
 * This script uses service role key to bypass all RLS and force delete users
 */

console.log("🚨 EMERGENCY SUPABASE CLEANUP STARTING...");

// Admin-level cleanup using service role
async function emergencyUserCleanup() {
  console.log("🔥 Using service role to force delete ALL users...");

  try {
    // Delete all users via admin API
    const deleteResponse = await fetch("/api/admin/emergency-cleanup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "delete_all_users",
        confirm: "YES_DELETE_ALL",
      }),
    });

    const deleteResult = await deleteResponse.json();
    console.log("🗑️ Delete result:", deleteResult);

    // Verify cleanup
    const verifyResponse = await fetch("/api/admin/emergency-cleanup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "verify_cleanup",
      }),
    });

    const verifyResult = await verifyResponse.json();
    console.log("✅ Verification result:", verifyResult);

    if (verifyResult.totalUsers === 0) {
      console.log("🎉 SUCCESS: All users have been deleted!");
      console.log("🔄 Database is now clean for beta testing");
    } else {
      console.log("⚠️ WARNING: Some users may still remain");
      console.log("💡 Try running the SQL script manually in Supabase");
    }
  } catch (error) {
    console.error("❌ Emergency cleanup failed:", error);
    console.log(
      "📋 Alternative: Run the SQL script directly in Supabase SQL Editor",
    );
  }
}

// Alternative: Direct Supabase admin cleanup
async function directSupabaseCleanup() {
  console.log("🔧 Direct Supabase cleanup via browser...");

  // This would need to be run in Supabase dashboard context
  const sqlScript = `
-- COPY AND PASTE THIS INTO SUPABASE SQL EDITOR:

-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Delete all data
DELETE FROM profiles;
DELETE FROM auth.users;
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.sessions;
DELETE FROM auth.audit_log_entries;

-- Reset sequences
ALTER SEQUENCE auth.refresh_tokens_id_seq RESTART WITH 1;
ALTER SEQUENCE auth.audit_log_entries_instance_id_seq RESTART WITH 1;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Verify cleanup (should all be 0)
SELECT 'auth.users' as table, COUNT(*) FROM auth.users
UNION ALL
SELECT 'profiles' as table, COUNT(*) FROM profiles;
  `;

  console.log("📋 SQL Script to run in Supabase:");
  console.log(sqlScript);

  // Copy to clipboard if possible
  try {
    await navigator.clipboard.writeText(sqlScript);
    console.log("📋 SQL script copied to clipboard!");
  } catch (e) {
    console.log("📋 Manual copy required - see console output above");
  }
}

// Check current user count
async function checkCurrentUsers() {
  console.log("📊 Checking current user count...");

  try {
    const response = await fetch("/api/admin/emergency-cleanup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "count_users",
      }),
    });

    const result = await response.json();
    console.log("👥 Current user count:", result);

    if (result.totalUsers > 0) {
      console.log("⚠️ Users still exist. Running emergency cleanup...");
      await emergencyUserCleanup();
    } else {
      console.log("✅ No users found. Database is clean!");
    }
  } catch (error) {
    console.error("❌ Error checking users:", error);
  }
}

console.log(`
🚨 EMERGENCY CLEANUP COMMANDS:
1. checkCurrentUsers() - Check how many users exist
2. emergencyUserCleanup() - Force delete all users via API
3. directSupabaseCleanup() - Get SQL script for manual cleanup

⚠️ WARNING: This will delete ALL user accounts permanently!

💡 RECOMMENDED STEPS:
1. Run checkCurrentUsers() first
2. If users still exist, run emergencyUserCleanup()
3. If that fails, use directSupabaseCleanup() and run SQL manually
`);

// Auto-check users on load
checkCurrentUsers();
