/**
 * SPECIFIC USER DELETION SCRIPT
 * For deleting the remaining user: larrybesant@gmail.com (UID: 48a955b2-040e-4add-9342-625e1ffdca43)
 */

console.log("🎯 TARGET USER DELETION SCRIPT");
console.log("👤 Target: larrybesant@gmail.com");
console.log("🆔 UID: 48a955b2-040e-4add-9342-625e1ffdca43");

// Delete specific user by UID
async function deleteSpecificUser() {
  const targetUID = "48a955b2-040e-4add-9342-625e1ffdca43";
  console.log(`🗑️ Attempting to delete user: ${targetUID}`);

  try {
    const response = await fetch("/api/admin/emergency-cleanup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "delete_specific_user",
        userId: targetUID,
        confirm: "YES_DELETE_SPECIFIC",
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ User deletion result:", result);

      // Verify deletion
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await verifyUserDeleted(targetUID);
    } else {
      console.error("❌ User deletion failed:", result);
      console.log("💡 Try manual deletion in Supabase dashboard");
    }
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    console.log("📋 Manual steps required - see instructions below");
  }
}

// Verify user is deleted
async function verifyUserDeleted(userId) {
  console.log(`🔍 Verifying user ${userId} is deleted...`);

  try {
    const response = await fetch("/api/admin/emergency-cleanup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "verify_specific_user",
        userId: userId,
      }),
    });

    const result = await response.json();

    if (result.userExists === false) {
      console.log("🎉 SUCCESS: User has been completely deleted!");
      console.log("✅ Database is now clean for beta testing");
    } else {
      console.log("⚠️ User may still exist. Manual deletion needed.");
      showManualSteps();
    }
  } catch (error) {
    console.error("❌ Verification failed:", error);
  }
}

// Show manual deletion steps
function showManualSteps() {
  console.log(`
🔧 MANUAL DELETION STEPS:

1. In Supabase Dashboard:
   - Go to Authentication → Users
   - Find user: larrybesant@gmail.com
   - Click the user row
   - Scroll to "Danger zone"
   - Click "Delete user"
   - Confirm deletion

2. Alternative SQL approach:
   - Go to SQL Editor in Supabase
   - Run this query:
   
   DELETE FROM auth.users WHERE id = '48a955b2-040e-4add-9342-625e1ffdca43';
   DELETE FROM profiles WHERE id = '48a955b2-040e-4add-9342-625e1ffdca43';

3. Force cleanup (if above fails):
   - Run: forceDeleteAllRemaining()
  `);
}

// Force delete all remaining users
async function forceDeleteAllRemaining() {
  console.log("🔥 FORCE DELETING ALL REMAINING USERS...");

  try {
    const response = await fetch("/api/admin/emergency-cleanup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "delete_all_users",
        confirm: "YES_DELETE_ALL",
      }),
    });

    const result = await response.json();
    console.log("🗑️ Force deletion result:", result);

    // Final verification
    setTimeout(async () => {
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
      console.log("🔍 Final verification:", verifyResult);

      if (verifyResult.verification?.totalUsers === 0) {
        console.log("🎉 SUCCESS: All users deleted!");
      } else {
        console.log(
          "⚠️ Some users may still remain - manual SQL cleanup needed",
        );
      }
    }, 2000);
  } catch (error) {
    console.error("❌ Force deletion failed:", error);
  }
}

console.log(`
🎯 AVAILABLE COMMANDS:
1. deleteSpecificUser() - Delete the specific user shown in dashboard
2. forceDeleteAllRemaining() - Force delete ALL users
3. showManualSteps() - Show manual deletion instructions

⚡ QUICK ACTION:
Run deleteSpecificUser() to target the specific user you're viewing
`);

// Auto-run specific user deletion
console.log("🚀 Auto-running specific user deletion...");
deleteSpecificUser();
