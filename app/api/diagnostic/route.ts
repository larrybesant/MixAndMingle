import { NextResponse } from "next/server";

type EnvVarStatus = { exists: boolean; preview: string };
type Environment = {
  required: Record<string, EnvVarStatus>;
  optional: Record<string, EnvVarStatus>;
};
type SupabaseStatus =
  | { connected: false; error: string; code?: string }
  | { connected: true; tablesExist: false; message: string }
  | { connected: true; tablesExist: true; profileCount: number };
type TableStatus = { exists: boolean; status: string };
type Tables = Record<string, TableStatus>;
type Summary = {
  status: string;
  message: string;
  nextSteps: string[];
};
type Results = {
  timestamp: string;
  environment: Environment;
  supabase: SupabaseStatus | object;
  auth: object;
  tables: Tables;
  storage: object;
  summary: Summary | object;
};

export async function GET() {
  const results: Results = {
    timestamp: new Date().toISOString(),
    environment: { required: {}, optional: {} },
    supabase: {},
    auth: {},
    tables: {},
    storage: {},
    summary: {},
  };

  try {
    // 1. Check Environment Variables
    console.log("🔍 Checking environment variables...");
    const requiredVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "DATABASE_URL",
    ];

    results.environment = {
      required: {},
      optional: {},
    };

    requiredVars.forEach((varName) => {
      const value = process.env[varName];
      results.environment.required[varName] = {
        exists: !!value,
        preview: value ? `${value.substring(0, 20)}...` : "NOT SET",
      };
    });

    // 2. Check Supabase Connection
    console.log("🔗 Testing Supabase connection...");
    try {
      const { createClient } = await import("@supabase/supabase-js");

      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        results.supabase = {
          connected: false,
          error: "Missing Supabase environment variables",
        };
      } else {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        );

        // Test basic connection by trying to access profiles table
        const { data, error } = await supabase
          .from("profiles")
          .select("count(*)")
          .limit(1);

        type ProfileCountRow = { count: number };
        const rows = data as ProfileCountRow[] | null;

        if (error) {
          if (error.code === "42P01") {
            results.supabase = {
              connected: true,
              tablesExist: false,
              message: "Connection works but profiles table does not exist",
            };
          } else {
            results.supabase = {
              connected: false,
              error: error.message,
              code: error.code,
            };
          }
        } else {
          const count =
            Array.isArray(rows) &&
            rows.length > 0 &&
            typeof rows[0].count === "number"
              ? rows[0].count
              : 0;
          results.supabase = {
            connected: true,
            tablesExist: true,
            profileCount: count,
          };
        }
      }
    } catch (err) {
      results.supabase = {
        connected: false,
        error: `Connection failed: ${err}`,
      };
    }

    // 3. Check Database Tables
    console.log("🗄️ Checking database tables...");
    let supabaseConnected = false;
    if (
      typeof results.supabase === "object" &&
      results.supabase !== null &&
      "connected" in results.supabase &&
      typeof (results.supabase as SupabaseStatus).connected === "boolean"
    ) {
      supabaseConnected = (results.supabase as SupabaseStatus).connected;
    }
    if (supabaseConnected) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const tables = ["profiles", "dj_rooms", "messages", "matches", "swipes"];
      results.tables = {};

      for (const table of tables) {
        try {
          const { error } = await supabase
            .from(table)
            .select("count(*)")
            .limit(1);

          if (error) {
            if (error.code === "42P01") {
              results.tables[table] = {
                exists: false,
                status: "Table does not exist",
              };
            } else {
              results.tables[table] = {
                exists: false,
                status: `Error: ${error.message}`,
              };
            }
          } else {
            results.tables[table] = {
              exists: true,
              status: "Table exists and accessible",
            };
          }
        } catch (err) {
          results.tables[table] = {
            exists: false,
            status: `Check failed: ${err}`,
          };
        }
      }
    }

    // 4. Generate Summary
    const hasSupabaseVars =
      results.environment.required["NEXT_PUBLIC_SUPABASE_URL"].exists &&
      results.environment.required["NEXT_PUBLIC_SUPABASE_ANON_KEY"].exists;

    const tablesExist = Object.values(results.tables).some(
      (table: TableStatus) => table.exists,
    );

    if (!hasSupabaseVars) {
      results.summary = {
        status: "CRITICAL",
        message: "Missing Supabase environment variables",
        nextSteps: [
          "Add NEXT_PUBLIC_SUPABASE_URL to environment variables",
          "Add NEXT_PUBLIC_SUPABASE_ANON_KEY to environment variables",
        ],
      };
    } else if (
      typeof results.supabase === "object" &&
      results.supabase !== null &&
      "connected" in results.supabase &&
      (results.supabase as SupabaseStatus).connected === false
    ) {
      results.summary = {
        status: "ERROR",
        message: "Cannot connect to Supabase",
        nextSteps: [
          "Verify Supabase URL and API key are correct",
          "Check Supabase project status",
        ],
      };
    } else if (!tablesExist) {
      results.summary = {
        status: "SETUP_NEEDED",
        message: "Supabase connected but database tables need to be created",
        nextSteps: [
          "Run database setup script",
          "Create profiles table",
          "Set up RLS policies",
        ],
      };
    } else {
      results.summary = {
        status: "READY",
        message: "System is ready for development!",
        nextSteps: ["Test user authentication", "Create your first profile"],
      };
    }
  } catch (error) {
    results.summary = {
      status: "ERROR",
      message: `Diagnostic failed: ${error}`,
      nextSteps: ["Check server logs for more details"],
    };
  }

  return NextResponse.json(results, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
