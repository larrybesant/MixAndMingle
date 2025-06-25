const { supabase } = require("./lib/supabase/client.ts");
const fs = require("fs");

async function setupCommunitiesSchema() {
  try {
    console.log("Setting up communities schema...");

    // Read the SQL file
    const sql = fs.readFileSync("./database/communities-schema.sql", "utf8");

    // Split into individual statements
    const statements = sql.split(";").filter((stmt) => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        console.log("Executing:", statement.trim().substring(0, 50) + "...");
        const { error } = await supabase.rpc("exec_sql", {
          sql_query: statement.trim(),
        });
        if (error) {
          console.error("SQL Error:", error);
        } else {
          console.log("✓ Success");
        }
      }
    }

    console.log("Communities schema setup complete!");
  } catch (error) {
    console.error("Error setting up schema:", error);
  }
}

setupCommunitiesSchema();
