/**
 * EMERGENCY USER CLEANUP - COPY AND PASTE IN BROWSER CONSOLE
 * Go to http://localhost:3001/signup and paste this in DevTools Console (F12)
 */

console.log("🧹 EMERGENCY USER CLEANUP STARTING...");

// Method 1: Try direct Supabase cleanup
(async function emergencyCleanup() {
  try {
    console.log("📋 Step 1: Getting Supabase client...");

    // Try to get supabase from the global window object
    let supabase;

    // Check if we can access it from the page
    if (window._supabaseClient) {
      supabase = window._supabaseClient;
    } else {
      // Try to import it
      try {
        const module = await import("@supabase/supabase-js");
        const { createClient } = module;

        // Use environment variables if available
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL";
        const key =
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "YOUR_ANON_KEY";

        if (url === "YOUR_SUPABASE_URL") {
          throw new Error("Need to configure Supabase manually");
        }

        supabase = createClient(url, key);
      } catch (importError) {
        console.log("⚠️ Cannot import Supabase, trying page-based approach...");
        throw importError;
      }
    }

    console.log("✅ Got Supabase client");

    // Step 2: Get all profiles
    console.log("📊 Step 2: Fetching all profiles...");
    const { data: profiles, error: fetchError } = await supabase
      .from("profiles")
      .select("id, username, full_name, email")
      .limit(50); // Safety limit

    if (fetchError) {
      console.error("❌ Fetch error:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${profiles?.length || 0} profiles:`, profiles);

    if (!profiles || profiles.length === 0) {
      console.log("🎉 NO USERS FOUND - DATABASE IS ALREADY CLEAN!");
      console.log("✨ Ready to test signup with language selection!");
      return;
    }

    // Step 3: Delete profiles
    console.log("🗑️ Step 3: Deleting all profiles...");
    const { error: deleteError } = await supabase
      .from("profiles")
      .delete()
      .neq("id", ""); // Delete all

    if (deleteError) {
      console.error("❌ Delete error:", deleteError);

      // Try individual deletion
      console.log("🔄 Trying individual deletion...");
      let deleted = 0;
      for (const profile of profiles) {
        const { error: individualError } = await supabase
          .from("profiles")
          .delete()
          .eq("id", profile.id);

        if (!individualError) {
          console.log(`✅ Deleted: ${profile.username || profile.id}`);
          deleted++;
        } else {
          console.log(`❌ Failed: ${profile.username || profile.id}`);
        }
      }
      console.log(`🎯 Deleted ${deleted}/${profiles.length} profiles`);
    } else {
      console.log(`✅ Successfully deleted all ${profiles.length} profiles!`);
    }

    // Step 4: Sign out current user
    console.log("🚪 Step 4: Signing out current user...");
    const { data: currentUser } = await supabase.auth.getUser();
    if (currentUser.user) {
      await supabase.auth.signOut();
      console.log("✅ Signed out current user");
    } else {
      console.log("ℹ️ No current user to sign out");
    }

    // Step 5: Success!
    console.log("");
    console.log("🎉 CLEANUP COMPLETE!");
    console.log("✨ Database is clean and ready for testing");
    console.log("🌍 Go test language selection on signup page!");
    console.log("");
    console.log("🔄 Refreshing page in 3 seconds...");

    setTimeout(() => {
      window.location.href = "/signup";
    }, 3000);
  } catch (error) {
    console.error("❌ CLEANUP FAILED:", error);
    console.log("");
    console.log("🔧 MANUAL CLEANUP REQUIRED:");
    console.log("1. Go to Supabase Dashboard");
    console.log("2. Authentication → Users → Delete all manually");
    console.log("3. Table Editor → profiles → Delete all rows");
    console.log("");
    console.log(
      "⚡ OR just create a new account - language feature still works!",
    );
  }
})();

console.log("⏱️ Cleanup started... watch for progress above ↑");
