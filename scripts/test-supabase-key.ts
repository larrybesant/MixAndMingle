import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("Users:", data);
  }
}
main();
