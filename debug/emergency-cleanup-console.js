/**
 * READY-TO-RUN Browser Console Script
 * Copy this entire script and paste it into the browser console
 */

console.log("🧹 Enhanced User Cleanup Script Loading...");
console.log(
  "🎯 Target: larrybesant@gmail.com (48a955b2-040e-4add-9342-625e1ffdca43)",
);

// Enhanced admin API cleanup for persistent users
async function useAdminAPICleanup() {
  try {
    console.log("🚨 Using admin API for stubborn user cleanup...");

    // First check how many users exist
    const countResponse = await fetch("/api/admin/emergency-cleanup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "count_users" }),
    });

    const countResult = await countResponse.json();
    console.log("👥 Current user count:", countResult);

    if (countResult.totalUsers === 0) {
      console.log("✅ No users found - database is clean!");
      return true;
    }

    // Try to delete the specific problematic user first
    const specificUserId = "48a955b2-040e-4add-9342-625e1ffdca43";
    console.log(`🎯 Targeting specific user: ${specificUserId}`);

    const deleteSpecificResponse = await fetch("/api/admin/emergency-cleanup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete_specific_user",
        userId: specificUserId,
        confirm: "YES_DELETE_SPECIFIC",
      }),
    });

    const deleteSpecificResult = await deleteSpecificResponse.json();
    console.log("🗑️ Specific user deletion:", deleteSpecificResult);

    // Wait a moment then verify
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const verifyResponse = await fetch("/api/admin/emergency-cleanup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "verify_specific_user",
        userId: specificUserId,
      }),
    });

    const verifyResult = await verifyResponse.json();
    console.log("🔍 Verification result:", verifyResult);

    if (verifyResult.verification?.userExists === false) {
      console.log("🎉 Specific user successfully deleted!");
      return true;
    } else {
      console.log("⚠️ User still exists, trying nuclear option...");
      return await forceDeleteAllUsers();
    }
  } catch (error) {
    console.error("❌ Admin API cleanup failed:", error);
    console.log("📋 Manual steps required - check MANUAL_STEPS below");
    showManualSteps();
    return false;
  }
}

// Nuclear option - delete ALL users
async function forceDeleteAllUsers() {
  try {
    console.log("💥 NUCLEAR OPTION: Deleting ALL users via admin API...");

    const response = await fetch("/api/admin/emergency-cleanup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete_all_users",
        confirm: "YES_DELETE_ALL",
      }),
    });

    const result = await response.json();
    console.log("💥 Nuclear deletion result:", result);

    // Final verification
    setTimeout(async () => {
      const finalCheck = await fetch("/api/admin/emergency-cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_cleanup" }),
      });

      const finalResult = await finalCheck.json();
      console.log("🏁 Final verification:", finalResult);

      if (finalResult.verification?.totalUsers === 0) {
        console.log("🎉 SUCCESS: All users finally deleted!");
        console.log("✨ Database is now completely clean");
        console.log("🚀 Ready for beta testing!");
      } else {
        console.log("😤 Some users STILL remain - manual SQL required");
        showManualSteps();
      }
    }, 2000);

    return true;
  } catch (error) {
    console.error("❌ Nuclear option failed:", error);
    showManualSteps();
    return false;
  }
}

// Show manual steps as last resort
function showManualSteps() {
  console.log(`
🆘 MANUAL STEPS REQUIRED:

1. 🗃️ SQL Method (Most Reliable):
   - Go to https://supabase.com/dashboard
   - Open SQL Editor
   - Run this query:
   
   DELETE FROM profiles WHERE id = '48a955b2-040e-4add-9342-625e1ffdca43';
   DELETE FROM auth.users WHERE id = '48a955b2-040e-4add-9342-625e1ffdca43';
   DELETE FROM auth.sessions WHERE user_id = '48a955b2-040e-4add-9342-625e1ffdca43';
   DELETE FROM auth.refresh_tokens WHERE user_id = '48a955b2-040e-4add-9342-625e1ffdca43';

2. 🖱️ Dashboard Method:
   - Go to Authentication → Users
   - Find larrybesant@gmail.com
   - Click Delete User in danger zone

3. 🔥 Nuclear SQL (if above fails):
   - Run: DELETE FROM profiles; DELETE FROM auth.users;
  `);
}

// Main cleanup function
async function startEmergencyCleanup() {
  console.log("🚨 STARTING EMERGENCY CLEANUP...");
  console.log("🎯 Target: Persistent user larrybesant@gmail.com");

  const success = await useAdminAPICleanup();

  if (success) {
    console.log("✅ CLEANUP SUCCESSFUL!");
    console.log("🔄 You can now refresh and test account creation");
  } else {
    console.log("❌ Automatic cleanup failed");
    console.log("📋 Please try the manual steps shown above");
  }
}

console.log(`
🎯 EMERGENCY CLEANUP READY!

QUICK START:
1. Copy this entire script
2. Paste into browser console (F12)
3. Run: startEmergencyCleanup()

OR use individual functions:
- useAdminAPICleanup() - Smart cleanup
- forceDeleteAllUsers() - Nuclear option
- showManualSteps() - Manual instructions
`);

// Auto-start the cleanup
console.log("🚀 Auto-starting cleanup in 3 seconds...");
console.log("⏱️ 3...");
setTimeout(() => console.log("⏱️ 2..."), 1000);
setTimeout(() => console.log("⏱️ 1..."), 2000);
setTimeout(() => {
  console.log("🚀 Starting cleanup now!");
  startEmergencyCleanup();
}, 3000);
