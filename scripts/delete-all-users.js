require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function deleteAllUsers() {
  let nextPage = null;
  let totalDeleted = 0;
  do {
    const { data, error } = await supabase.auth.admin.listUsers({
      page: nextPage,
      perPage: 1000,
    });
    if (error) {
      console.error("Error fetching users:", error.message);
      process.exit(1);
    }
    if (!data || !data.users || data.users.length === 0) break;
    for (const user of data.users) {
      const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
      if (delError) {
        console.error(
          `Failed to delete user ${user.email || user.id}:`,
          delError.message,
        );
      } else {
        console.log(`Deleted user: ${user.email || user.id}`);
        totalDeleted++;
      }
    }
    nextPage = data.nextPage ?? null;
  } while (nextPage);
  console.log(`Total users deleted: ${totalDeleted}`);
}

deleteAllUsers().then(() => process.exit(0));
