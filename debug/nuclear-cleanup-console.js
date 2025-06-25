// ENHANCED NUCLEAR CLEANUP - Force delete all users
console.log("💥 NUCLEAR CLEANUP: Deleting ALL users from Supabase...");

async function nuclearCleanup() {
  try {
    // Use the admin API to force delete all users
    console.log("🔥 Step 1: Using admin API to delete all users...");

    const response = await fetch("/api/admin/emergency-cleanup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete_all_users",
        confirm: "YES_DELETE_ALL",
      }),
    });

    const result = await response.json();
    console.log("💥 Admin API result:", result);

    // Wait a moment for the deletion to process
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Verify the cleanup worked
    console.log("🔍 Step 2: Verifying cleanup...");
    const verifyResponse = await fetch("/api/admin/emergency-cleanup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify_cleanup" }),
    });

    const verifyResult = await verifyResponse.json();
    console.log("📊 Verification result:", verifyResult);

    const totalUsers = verifyResult.verification?.totalUsers || 0;

    if (totalUsers === 0) {
      console.log("🎉 SUCCESS: Nuclear cleanup worked! All users deleted!");
      console.log("✨ Database is now completely clean");
      console.log("🔄 Try creating an account now");
    } else {
      console.log(`❌ FAILED: ${totalUsers} users still remain`);
      console.log("📋 Manual SQL cleanup required");
      showSQLInstructions();
    }
  } catch (error) {
    console.error("💥 Nuclear cleanup failed:", error);
    console.log("📋 You must run the SQL manually");
    showSQLInstructions();
  }
}

function showSQLInstructions() {
  console.log(`
🆘 MANUAL SQL CLEANUP REQUIRED:

1. Go to: https://supabase.com/dashboard
2. Open your project → SQL Editor  
3. Copy and paste this query:

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
DELETE FROM auth.sessions;
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.audit_log_entries;
DELETE FROM profiles;
DELETE FROM auth.users;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

4. Click "RUN" to execute
5. Verify all counts are 0

💡 This will delete ALL users and reset the database completely.
  `);
}

// Auto-run the nuclear cleanup
console.log("🚀 Starting nuclear cleanup in 2 seconds...");
setTimeout(() => {
  nuclearCleanup();
}, 2000);
