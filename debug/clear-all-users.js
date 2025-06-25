const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  console.log("Make sure you have:");
  console.log("- NEXT_PUBLIC_SUPABASE_URL");
  console.log("- SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function clearAllUsers() {
  try {
    console.log("🧹 Starting to clear all users...");

    // First, get all users to see what we're working with
    console.log("\n📊 Checking current users...");
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, email");

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return;
    }

    console.log(`Found ${profiles?.length || 0} user profiles`);
    if (profiles && profiles.length > 0) {
      profiles.forEach((profile) => {
        console.log(
          `- ${profile.username || "No username"} (${profile.email || profile.id})`,
        );
      });
    }

    // Clear profiles table first
    console.log("\n🗑️  Clearing profiles table...");
    const { error: clearProfilesError } = await supabase
      .from("profiles")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Don't delete system users if any

    if (clearProfilesError) {
      console.error("❌ Error clearing profiles:", clearProfilesError);
      return;
    }
    console.log("✅ Profiles cleared");

    // Get auth users (this requires admin access)
    console.log("\n👥 Checking auth users...");
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("❌ Error fetching auth users:", authError);
      console.log(
        "💡 You may need to manually delete auth users from Supabase dashboard",
      );
    } else {
      console.log(`Found ${authUsers.users?.length || 0} auth users`);

      // Delete each auth user
      if (authUsers.users && authUsers.users.length > 0) {
        console.log("\n🗑️  Deleting auth users...");
        for (const user of authUsers.users) {
          console.log(`Deleting user: ${user.email || user.id}`);
          const { error: deleteError } = await supabase.auth.admin.deleteUser(
            user.id,
          );
          if (deleteError) {
            console.error(`❌ Error deleting user ${user.id}:`, deleteError);
          } else {
            console.log(`✅ Deleted user: ${user.email || user.id}`);
          }
        }
      }
    }

    // Verify cleanup
    console.log("\n🔍 Verifying cleanup...");
    const { data: remainingProfiles } = await supabase
      .from("profiles")
      .select("id");

    const { data: remainingAuthUsers } = await supabase.auth.admin.listUsers();

    console.log(`\n📊 Cleanup Results:`);
    console.log(`- Profiles remaining: ${remainingProfiles?.length || 0}`);
    console.log(
      `- Auth users remaining: ${remainingAuthUsers?.users?.length || 0}`,
    );

    if (
      (remainingProfiles?.length || 0) === 0 &&
      (remainingAuthUsers?.users?.length || 0) === 0
    ) {
      console.log("\n🎉 All users successfully cleared!");
      console.log(
        "✨ Ready to test first account creation with language selection",
      );
    } else {
      console.log(
        "\n⚠️  Some users may remain - check Supabase dashboard if needed",
      );
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

// Safety confirmation
console.log("⚠️  WARNING: This will delete ALL users from the database!");
console.log("🧪 This is for testing purposes only.");
console.log("⏱️  Starting cleanup in 3 seconds...");

setTimeout(() => {
  clearAllUsers();
}, 3000);
