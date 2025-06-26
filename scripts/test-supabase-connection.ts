import { supabase } from "../lib/supabase/client"

async function testSupabaseConnection() {
  console.log("🧪 Testing Supabase Connection...")
  console.log("================================")

  try {
    // Test 1: Basic connection
    console.log("1. Testing basic connection...")
    const { data, error } = await supabase.from("profiles").select("count(*)")

    if (error) {
      if (error.code === "42P01") {
        console.log("❌ Profiles table doesn't exist yet")
        console.log("✅ But connection to Supabase is working!")
        return true
      } else {
        console.log("❌ Connection error:", error.message)
        return false
      }
    }

    console.log("✅ Connection successful!")
    console.log("✅ Profiles table exists!")
    return true
  } catch (err) {
    console.error("❌ Connection failed:", err)
    return false
  }
}

// Test auth
async function testAuth() {
  console.log("\n2. Testing authentication...")

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.log("❌ Auth error:", error.message)
      return false
    }

    if (session) {
      console.log("✅ User is logged in:", session.user.email)
    } else {
      console.log("ℹ️  No user currently logged in (this is normal)")
    }

    return true
  } catch (err) {
    console.error("❌ Auth test failed:", err)
    return false
  }
}

// Run tests
async function runTests() {
  const connectionOk = await testSupabaseConnection()
  const authOk = await testAuth()

  console.log("\n📊 TEST RESULTS")
  console.log("================")
  console.log(`Connection: ${connectionOk ? "✅ PASS" : "❌ FAIL"}`)
  console.log(`Authentication: ${authOk ? "✅ PASS" : "❌ FAIL"}`)

  if (connectionOk && authOk) {
    console.log("\n🎉 All tests passed! Your Supabase setup is working.")
  } else {
    console.log("\n⚠️  Some tests failed. Check your environment variables.")
  }
}

runTests()
