/**
 * Client-Side User Cleanup Script
 * This works with regular client permissions and avoids JWT issues
 */

// Copy this entire script and paste it in your browser console at http://localhost:3001/signup

async function simpleUserCleanup() {
  console.log("🧹 Starting simple user cleanup...");

  try {
    // Import Supabase from the app
    const { supabase } = await import("/app/lib/supabase/client.js").catch(
      () => {
        // Fallback: try to get from window if available
        return { supabase: window.supabase };
      },
    );

    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    console.log("📋 Getting current profiles...");

    // Get all profiles (this works with RLS)
    const { data: profiles, error: fetchError } = await supabase
      .from("profiles")
      .select("id, username, full_name")
      .limit(100); // Safety limit

    if (fetchError) {
      console.error("❌ Error fetching profiles:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${profiles?.length || 0} profiles:`, profiles);

    if (!profiles || profiles.length === 0) {
      console.log("✅ No profiles found - database is clean!");
      return { success: true, message: "No users to delete" };
    }

    // Delete profiles one by one (safer approach)
    console.log("🗑️ Deleting profiles...");
    let deletedCount = 0;

    for (const profile of profiles) {
      const { error: deleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", profile.id);

      if (deleteError) {
        console.error(`❌ Failed to delete ${profile.username}:`, deleteError);
      } else {
        console.log(`✅ Deleted: ${profile.username || profile.id}`);
        deletedCount++;
      }
    }

    console.log(
      `🎉 Cleanup complete! Deleted ${deletedCount}/${profiles.length} profiles`,
    );

    // Sign out any current user
    const { data: currentUser } = await supabase.auth.getUser();
    if (currentUser.user) {
      await supabase.auth.signOut();
      console.log("🚪 Signed out current user");
    }

    console.log("✨ Ready to test signup! Refresh the page.");
    return {
      success: true,
      deleted: deletedCount,
      total: profiles.length,
    };
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    console.log("");
    console.log("🔧 MANUAL CLEANUP REQUIRED:");
    console.log("1. Go to Supabase Dashboard");
    console.log("2. Authentication → Users → Delete users manually");
    console.log("3. Table Editor → profiles → Delete rows manually");
    console.log("");
    console.log("OR try this simpler approach:");
    console.log(
      "Just create a new test account - the language feature will still work!",
    );

    return { success: false, error: error.message };
  }
}

// Auto-run the cleanup
console.log("🚀 Starting user cleanup...");
simpleUserCleanup().then((result) => {
  if (result.success) {
    setTimeout(() => {
      console.log("🔄 Refreshing page in 2 seconds...");
      window.location.reload();
    }, 2000);
  }
});
