console.log("🔗 TESTING SUPABASE CONNECTION")
console.log("==============================")

async function testSupabaseConnection() {
  try {
    // Import Supabase client
    const { supabase } = await import("../lib/supabase/client")
    console.log("✅ Supabase client imported successfully")

    // Test basic connection
    console.log("\n🔍 Testing database connection...")
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      console.log(`❌ Database connection failed: ${error.message}`)

      // Check if it's a table not found error
      if (error.message.includes('relation "profiles" does not exist')) {
        console.log("💡 Database tables not created yet. Run the SQL schema first.")
      }
    } else {
      console.log("✅ Database connection successful")
    }

    // Test authentication
    console.log("\n🔐 Testing authentication...")
    const { data: authData, error: authError } = await supabase.auth.getSession()

    if (authError) {
      console.log(`❌ Auth test failed: ${authError.message}`)
    } else {
      console.log("✅ Authentication system accessible")
      console.log(`Current session: ${authData.session ? "Active" : "None"}`)
    }

    // Test real-time capabilities
    console.log("\n⚡ Testing real-time capabilities...")
    const channel = supabase.channel("test-channel")
    console.log("✅ Real-time channel created")

    // Clean up
    await supabase.removeChannel(channel)
    console.log("✅ Real-time channel cleaned up")
  } catch (error) {
    console.log(`❌ Supabase test failed: ${error.message}`)

    if (error.message.includes("NEXT_PUBLIC_SUPABASE_URL")) {
      console.log("💡 Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
    }
    if (error.message.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
      console.log("💡 Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
    }
  }
}

testSupabaseConnection()
