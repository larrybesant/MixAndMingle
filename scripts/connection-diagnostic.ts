console.log("🔍 COMPREHENSIVE CONNECTION DIAGNOSTIC")
console.log("=====================================")

async function checkEnvironmentVariables() {
  console.log("\n📋 1. ENVIRONMENT VARIABLES CHECK")
  console.log("----------------------------------")

  const requiredVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "DATABASE_URL",
  ]

  const optionalVars = ["DAILY_API_KEY", "RESEND_API_KEY", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"]

  console.log("Required Variables:")
  requiredVars.forEach((varName) => {
    const value = process.env[varName]
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`)
    } else {
      console.log(`❌ ${varName}: NOT SET`)
    }
  })

  console.log("\nOptional Variables:")
  optionalVars.forEach((varName) => {
    const value = process.env[varName]
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`)
    } else {
      console.log(`⚠️  ${varName}: NOT SET`)
    }
  })
}

async function checkSupabaseConnection() {
  console.log("\n🔗 2. SUPABASE CONNECTION CHECK")
  console.log("-------------------------------")

  try {
    const { supabase } = await import("../lib/supabase/client")
    console.log("✅ Supabase client imported successfully")

    // Test basic connection
    console.log("Testing basic connection...")
    const { count, error } = await supabase.from("profiles").select("*", { count: "exact", head: true })

    if (error) {
      if (error.code === "42P01") {
        console.log("⚠️  Profiles table doesn't exist yet")
        console.log("✅ But Supabase connection is working!")
        return { connected: true, tablesExist: false }
      } else {
        console.log(`❌ Database error: ${error.message}`)
        return { connected: false, tablesExist: false }
      }
    } else {
      console.log("✅ Profiles table exists and accessible")
      console.log(`📊 Current profile count: ${count || 0}`)
      return { connected: true, tablesExist: true }
    }
  } catch (err) {
    console.log(`❌ Supabase connection failed: ${err}`)
    return { connected: false, tablesExist: false }
  }
}

async function checkAuthSystem() {
  console.log("\n🔐 3. AUTHENTICATION SYSTEM CHECK")
  console.log("----------------------------------")

  try {
    const { supabase } = await import("../lib/supabase/client")

    // Check current session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.log(`❌ Auth system error: ${error.message}`)
      return { working: false, loggedIn: false }
    }

    if (session) {
      console.log("✅ Auth system working")
      console.log(`👤 Current user: ${session.user.email}`)
      console.log(`🆔 User ID: ${session.user.id}`)
      return { working: true, loggedIn: true, user: session.user }
    } else {
      console.log("✅ Auth system working")
      console.log("ℹ️  No user currently logged in")
      return { working: true, loggedIn: false }
    }
  } catch (err) {
    console.log(`❌ Auth check failed: ${err}`)
    return { working: false, loggedIn: false }
  }
}

async function checkDatabaseTables() {
  console.log("\n🗄️  4. DATABASE TABLES CHECK")
  console.log("----------------------------")

  try {
    const { supabase } = await import("../lib/supabase/client")

    const tables = ["profiles", "dj_rooms", "messages", "matches", "swipes"]

    const tableStatus: Record<string, boolean | "error"> = {}

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select("count(*)").limit(1)
        if (error) {
          if (error.code === "42P01") {
            console.log(`❌ ${table}: Table doesn't exist`)
            tableStatus[table] = false
          } else {
            console.log(`⚠️  ${table}: ${error.message}`)
            tableStatus[table] = "error"
          }
        } else {
          console.log(`✅ ${table}: Table exists and accessible`)
          tableStatus[table] = true
        }
      } catch (err) {
        console.log(`❌ ${table}: Check failed - ${err}`)
        tableStatus[table] = "error"
      }
    }

    return tableStatus
  } catch (err) {
    console.log(`❌ Database tables check failed: ${err}`)
    return {}
  }
}

async function checkStorageBuckets() {
  console.log("\n📁 5. STORAGE BUCKETS CHECK")
  console.log("---------------------------")

  try {
    const { supabase } = await import("../lib/supabase/client")

    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.log(`❌ Storage check failed: ${error.message}`)
      return { working: false }
    }

    console.log("✅ Storage system accessible")
    if (buckets && buckets.length > 0) {
      console.log("📦 Available buckets:")
      buckets.forEach((bucket) => {
        console.log(`   - ${bucket.name} (${bucket.public ? "public" : "private"})`)
      })
    } else {
      console.log("ℹ️  No storage buckets found")
    }

    return { working: true, buckets }
  } catch (err) {
    console.log(`❌ Storage check failed: ${err}`)
    return { working: false }
  }
}

async function checkRealTimeConnection() {
  console.log("\n⚡ 6. REAL-TIME CONNECTION CHECK")
  console.log("-------------------------------")

  try {
    const { supabase } = await import("../lib/supabase/client")

    const channel = supabase.channel("test-connection")

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log("⚠️  Real-time connection timeout")
        supabase.removeChannel(channel)
        resolve({ working: false })
      }, 5000)

      channel
        .on("presence", { event: "sync" }, () => {
          console.log("✅ Real-time connection working")
          clearTimeout(timeout)
          supabase.removeChannel(channel)
          resolve({ working: true })
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("✅ Real-time channel subscribed")
            clearTimeout(timeout)
            supabase.removeChannel(channel)
            resolve({ working: true })
          } else if (status === "CHANNEL_ERROR") {
            console.log("❌ Real-time channel error")
            clearTimeout(timeout)
            supabase.removeChannel(channel)
            resolve({ working: false })
          }
        })
    })
  } catch (err) {
    console.log(`❌ Real-time check failed: ${err}`)
    return { working: false }
  }
}

async function generateReport() {
  console.log("\n📊 DIAGNOSTIC SUMMARY")
  console.log("=====================")

  const envCheck = await checkEnvironmentVariables()
  const supabaseCheck = await checkSupabaseConnection()
  const authCheck = await checkAuthSystem()
  const tablesCheck = await checkDatabaseTables()
  const storageCheck = await checkStorageBuckets()
  const realtimeCheck = await checkRealTimeConnection()

  console.log("\n🎯 NEXT STEPS RECOMMENDATIONS:")
  console.log("------------------------------")

  if (!supabaseCheck.connected) {
    console.log("🔥 CRITICAL: Fix Supabase connection first")
    console.log("   - Check environment variables")
    console.log("   - Verify Supabase URL and keys")
  } else if (!supabaseCheck.tablesExist) {
    console.log("📋 TODO: Set up database tables")
    console.log("   - Run database setup script")
    console.log("   - Create profiles table")
  } else if (!authCheck.working) {
    console.log("🔐 TODO: Fix authentication system")
  } else {
    console.log("🎉 System looks good! Ready for development")
  }

  return {
    environment: envCheck,
    supabase: supabaseCheck,
    auth: authCheck,
    tables: tablesCheck,
    storage: storageCheck,
    realtime: realtimeCheck,
  }
}

// Run the full diagnostic
generateReport()
  .then(() => {
    console.log("\n✅ Diagnostic complete!")
  })
  .catch((err) => {
    console.error("❌ Diagnostic failed:", err)
  })
