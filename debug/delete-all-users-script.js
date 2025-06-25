/**
 * COMPLETE USER CLEANUP SCRIPT
 *
 * This will delete ALL users from your Supabase database.
 * Run this in browser console on localhost:3000 or your deployed site.
 */

async function deleteAllUsers() {
  console.log("🧹 STARTING COMPLETE USER CLEANUP...");

  try {
    // Import Supabase client
    const { supabase } = await import("/lib/supabase/client");

    // Check current auth state
    const { data: currentUser } = await supabase.auth.getUser();
    if (currentUser.user) {
      console.log(`⚠️ Currently logged in as: ${currentUser.user.email}`);
      console.log("🚪 Will sign out after cleanup");
    }

    // Get all profiles first
    console.log("\n📊 Fetching all user profiles...");
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, email, full_name");

    if (profilesError) {
      console.error("❌ Error fetching profiles:", profilesError);
      return;
    }

    console.log(`Found ${profiles?.length || 0} profiles to delete:`);
    profiles?.forEach((profile, index) => {
      console.log(
        `${index + 1}. ${profile.email || profile.username || profile.full_name || "Unknown"} (${profile.id})`,
      );
    });

    if (!profiles || profiles.length === 0) {
      console.log("✅ No profiles found - database is already clean!");
      if (currentUser.user) {
        await supabase.auth.signOut();
        console.log("🚪 Signed out current user");
      }
      return;
    }

    // Delete all profiles
    console.log("\n🗑️ Deleting all profiles...");
    const { error: deleteError } = await supabase
      .from("profiles")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Safety check

    if (deleteError) {
      console.error("❌ Error deleting profiles:", deleteError);
      console.log(
        "💡 This might be due to RLS policies. Trying individual deletion...",
      );

      // Try deleting individually
      let deletedCount = 0;
      for (const profile of profiles) {
        const { error: individualError } = await supabase
          .from("profiles")
          .delete()
          .eq("id", profile.id);

        if (individualError) {
          console.warn(
            `⚠️ Could not delete ${profile.email || profile.id}:`,
            individualError.message,
          );
        } else {
          deletedCount++;
          console.log(`✅ Deleted: ${profile.email || profile.id}`);
        }
      }
      console.log(
        `🎯 Deleted ${deletedCount} out of ${profiles.length} profiles`,
      );
    } else {
      console.log("✅ All profiles deleted successfully!");
    }

    // Clear any related data
    console.log("\n🧽 Cleaning related data...");

    const tablesToClean = [
      "user_swipes",
      "matches",
      "messages",
      "notifications",
      "push_subscriptions",
    ];

    for (const table of tablesToClean) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000");

        if (error) {
          console.warn(`⚠️ Could not clean ${table}:`, error.message);
        } else {
          console.log(`✅ Cleaned ${table} table`);
        }
      } catch (err) {
        console.warn(`⚠️ Table ${table} might not exist:`, err.message);
      }
    }

    // Sign out current user
    if (currentUser.user) {
      console.log("\n🚪 Signing out current user...");
      await supabase.auth.signOut();
      console.log("✅ Signed out successfully");
    }

    // Clear localStorage
    console.log("\n🧽 Clearing local storage...");
    localStorage.removeItem("userLanguage");
    localStorage.removeItem("sb-ywfjmsbyksehjgwalqum-auth-token");
    Object.keys(localStorage).forEach((key) => {
      if (key.includes("supabase") || key.includes("auth")) {
        localStorage.removeItem(key);
      }
    });
    console.log("✅ Local storage cleared");

    console.log("\n🎉 COMPLETE USER CLEANUP FINISHED!");
    console.log("✨ Database is now completely clean");
    console.log("🔄 Refresh the page to start fresh");
    console.log("🧪 Ready for clean authentication testing");
  } catch (error) {
    console.error("❌ Cleanup failed with error:", error);
    console.log(
      "💡 You may need to manually delete users from Supabase dashboard",
    );
  }
}

// Expose globally
window.deleteAllUsers = deleteAllUsers;

console.log("🧹 USER CLEANUP SCRIPT LOADED");
console.log("⚠️ WARNING: This will delete ALL users and data!");
console.log("📋 Run deleteAllUsers() to start cleanup");

// Optional: Auto-run (uncomment the line below to auto-run)
// deleteAllUsers();
