import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const users = [
  {
    email: "e2euser1@example.com",
    password: "TestPassword123!",
    username: "e2euser1",
  },
  {
    email: "e2euser2@example.com",
    password: "TestPassword123!",
    username: "e2euser2",
  },
  {
    email: "e2euser3@example.com",
    password: "TestPassword123!",
    username: "e2euser3",
  },
];

async function createUsers() {
  for (const user of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { username: user.username },
    });
    if (error) {
      console.error(`Failed to create user ${user.email}:`, error.message);
    } else {
      console.log(`Created user: ${user.email}`);
    }
  }
}

createUsers().then(() => process.exit(0));
