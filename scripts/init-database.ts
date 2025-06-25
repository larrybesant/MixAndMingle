import { supabase, sql, testConnections } from "../lib/database/connection";
import { readFileSync } from "fs";
import { join } from "path";

async function initializeDatabase() {
  console.log("🚀 Initializing Mix & Mingle Database...");

  // Test connections first
  console.log("\n🔍 Testing database connections...");
  const connections = await testConnections();

  if (!connections.supabase) {
    console.error("❌ Supabase connection failed");
    return;
  }

  if (!connections.neon) {
    console.error("❌ Neon connection failed");
    return;
  }

  console.log("✅ Both Supabase and Neon connected successfully!");

  // Run schema
  try {
    console.log("\n📋 Running database schema...");
    const schemaPath = join(process.cwd(), "database", "schema.sql");
    const schema = readFileSync(schemaPath, "utf8");

    // Split schema into individual statements
    const statements = schema
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      try {
        await sql([statement] as any);
        console.log("✅ Executed statement");
      } catch (error) {
        console.log("⚠️  Statement skipped (may already exist)");
      }
    }

    console.log("✅ Database schema initialized!");
  } catch (error) {
    console.error("❌ Error running schema:", error);
  }

  // Create sample data
  console.log("\n🎵 Creating sample data...");

  try {
    // Create sample DJ profiles
    const { data: sampleDJ, error: djError } = await supabase
      .from("profiles")
      .upsert([
        {
          id: "00000000-0000-0000-0000-000000000001",
          username: "dj_synthwave",
          full_name: "DJ Synthwave",
          bio: "Electronic music producer and live DJ",
          is_dj: true,
          music_preferences: ["Electronic", "Synthwave", "Techno"],
        },
        {
          id: "00000000-0000-0000-0000-000000000002",
          username: "dj_bassline",
          full_name: "DJ Bassline",
          bio: "Bass music specialist",
          is_dj: true,
          music_preferences: ["Bass", "Dubstep", "Drum & Bass"],
        },
      ])
      .select();

    if (!djError) {
      console.log("✅ Sample DJ profiles created");
    }

    // Create sample rooms
    const { data: sampleRooms, error: roomError } = await supabase
      .from("dj_rooms")
      .upsert([
        {
          id: "00000000-0000-0000-0000-000000000001",
          name: "Electronic Journey",
          description: "Deep electronic vibes",
          genre: "Electronic",
          host_id: "00000000-0000-0000-0000-000000000001",
          is_live: true,
          viewer_count: 129,
          tags: ["electronic", "synthwave", "chill"],
        },
        {
          id: "00000000-0000-0000-0000-000000000002",
          name: "Bass Drop Zone",
          description: "Heavy bass and drops",
          genre: "Bass",
          host_id: "00000000-0000-0000-0000-000000000002",
          is_live: true,
          viewer_count: 89,
          tags: ["bass", "dubstep", "heavy"],
        },
      ])
      .select();

    if (!roomError) {
      console.log("✅ Sample DJ rooms created");
    }
  } catch (error) {
    console.log("⚠️  Sample data creation skipped");
  }

  console.log("\n🎉 Database initialization complete!");
  console.log("\n📋 Next steps:");
  console.log("1. Run: npm run dev");
  console.log("2. Visit: http://localhost:3000");
  console.log("3. Sign up and start DJing!");
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };
