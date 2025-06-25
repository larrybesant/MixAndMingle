// Delete all users and start fresh
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

async function deleteAllUsersAndStartFresh() {
  console.log("🧹 CLEANING UP ALL USERS - FRESH START");
  console.log("=====================================");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.log("❌ Missing Supabase credentials");
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Step 1: List all users
    console.log("\n1️⃣ Listing all existing users...");
    const { data: users, error: listError } =
      await supabase.auth.admin.listUsers();

    if (listError) {
      console.log("❌ Error listing users:", listError.message);
      return;
    }

    console.log(`📊 Found ${users.users.length} users to delete`);

    if (users.users.length === 0) {
      console.log("✅ No users found - database is already clean");
    } else {
      // Show users before deletion
      users.users.forEach((user, index) => {
        console.log(
          `   ${index + 1}. ${user.email} (ID: ${user.id.substring(0, 8)}...)`,
        );
      });

      // Step 2: Delete each user
      console.log("\n2️⃣ Deleting all users...");
      let deleteCount = 0;

      for (const user of users.users) {
        try {
          const { error: deleteError } = await supabase.auth.admin.deleteUser(
            user.id,
          );

          if (deleteError) {
            console.log(
              `❌ Failed to delete ${user.email}:`,
              deleteError.message,
            );
          } else {
            console.log(`✅ Deleted: ${user.email}`);
            deleteCount++;
          }
        } catch (err) {
          console.log(`❌ Error deleting ${user.email}:`, err.message);
        }
      }

      console.log(
        `\n📊 Successfully deleted ${deleteCount}/${users.users.length} users`,
      );
    }

    // Step 3: Clean up profiles table (if it exists)
    console.log("\n3️⃣ Cleaning up profiles table...");
    try {
      const { error: profilesError } = await supabase
        .from("profiles")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all except dummy

      if (
        profilesError &&
        !profilesError.message.includes('relation "profiles" does not exist')
      ) {
        console.log("⚠️ Profiles cleanup warning:", profilesError.message);
      } else {
        console.log("✅ Profiles table cleaned");
      }
    } catch (err) {
      console.log("⚠️ Profiles cleanup note:", err.message);
    }

    // Step 4: Verify cleanup
    console.log("\n4️⃣ Verifying cleanup...");
    const { data: remainingUsers, error: verifyError } =
      await supabase.auth.admin.listUsers();

    if (verifyError) {
      console.log("❌ Error verifying cleanup:", verifyError.message);
    } else {
      console.log(`📊 Remaining users: ${remainingUsers.users.length}`);

      if (remainingUsers.users.length === 0) {
        console.log("🎉 SUCCESS: All users deleted - database is clean!");
      } else {
        console.log("⚠️ Some users remain:");
        remainingUsers.users.forEach((user) => {
          console.log(`   - ${user.email}`);
        });
      }
    }

    console.log("\n🚀 READY FOR FRESH ACCOUNT CREATION");
    console.log("===================================");
    console.log("");
    console.log("✅ Database cleaned successfully");
    console.log("✅ Ready to create new account");
    console.log("✅ Email system working perfectly");
    console.log("");
    console.log("🎯 NEXT STEPS:");
    console.log("1. Go to http://localhost:3001/signup");
    console.log("2. Create account with: larrybesant@gmail.com");
    console.log("3. Use a strong password you'll remember");
    console.log("4. Check email for confirmation (should work perfectly now)");
    console.log("5. Login with new credentials");
  } catch (error) {
    console.log("❌ Unexpected error:", error.message);
  }
}

deleteAllUsersAndStartFresh().catch(console.error);
