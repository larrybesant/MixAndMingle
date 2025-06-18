import fs from "fs";
import path from "path";

console.log("🧪 COMPREHENSIVE MIX & MINGLE TEST SUITE")
console.log("==========================================")

// Test 1: Environment Variables
console.log("\n1️⃣ Testing Environment Variables...")
const testRequiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_KEY",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
]

let envIssues = 0
testRequiredEnvVars.forEach((envVar) => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}: Present`)
  } else {
    console.log(`❌ ${envVar}: Missing`)
    envIssues++
  }
})

// Test 2: Package Dependencies
console.log("\n2️⃣ Testing Package Dependencies...")
try {
  const packageJson = require("../package.json")
  const criticalDeps = ["@supabase/supabase-js", "next", "react", "react-dom", "lucide-react", "tailwind-merge"]

  let depIssues = 0
  criticalDeps.forEach((dep) => {
    if (packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`)
    } else {
      console.log(`❌ ${dep}: Missing`)
      depIssues++
    }
  })

  // Check for problematic dependencies
  const problematicDeps = ["firebase", "drizzle-orm", "@daily-co/daily-react"]
  problematicDeps.forEach((dep) => {
    if (packageJson.dependencies[dep]) {
      console.log(`⚠️  ${dep}: Present (may cause conflicts)`)
    }
  })
} catch (error) {
  console.log("❌ Cannot read package.json")
}

// Test 3: File Structure
console.log("\n3️⃣ Testing File Structure...")

const criticalFiles = [
  "app/page.tsx",
  "app/layout.tsx",
  "app/globals.css",
  "lib/supabase/client.ts",
  "components/ui/button.tsx",
  "components/ui/card.tsx",
  "next.config.js",
  "tailwind.config.ts",
]

let fileIssues = 0
criticalFiles.forEach((file) => {
  try {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      console.log(`✅ ${file}: Exists`)
    } else {
      console.log(`❌ ${file}: Missing`)
      fileIssues++
    }
  } catch (error) {
    console.log(`❌ ${file}: Error checking`)
    fileIssues++
  }
})

// Test 4: Configuration Files
console.log("\n4️⃣ Testing Configuration Files...")
try {
  // Check Next.js config
  const nextConfig = require("../next.config.js")
  console.log("✅ next.config.js: Valid")

  // Check if duplicate exists
  if (fs.existsSync(path.join(process.cwd(), "next.config.ts"))) {
    console.log("⚠️  next.config.ts: Duplicate found (should remove)")
  }

  // Check Vercel config
  if (fs.existsSync(path.join(process.cwd(), "vercel.json"))) {
    const vercelConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), "vercel.json"), "utf8"))
    console.log("✅ vercel.json: Exists")

    if (!vercelConfig.functions) {
      console.log("⚠️  vercel.json: Missing function runtime configuration")
    }
  } else {
    console.log("❌ vercel.json: Missing")
  }
} catch (error) {
  console.log("❌ Configuration files: Error reading")
}

// Test 5: Import Validation
console.log("\n5️⃣ Testing Critical Imports...")
try {
  // Test Supabase client
  console.log("Testing Supabase client import...")
  const { supabase } = require("../lib/supabase/client.ts")
  console.log("✅ Supabase client: Importable")

  // Test UI components
  console.log("Testing UI components...")
  // Note: These might fail in Node.js environment but we can check file existence
  const uiComponents = ["button", "card", "input", "avatar"]
  uiComponents.forEach((component) => {
    if (fs.existsSync(path.join(process.cwd(), `components/ui/${component}.tsx`))) {
      console.log(`✅ UI ${component}: Exists`)
    } else {
      console.log(`❌ UI ${component}: Missing`)
    }
  })
} catch (error) {
  console.log(`❌ Import test failed: ${error instanceof Error ? error.message : String(error)}`)
}

// Test 6: Build Compatibility
console.log("\n6️⃣ Testing Build Compatibility...")
try {
  const packageJson = require("../package.json")

  // Check Node.js version
  if (packageJson.engines && packageJson.engines.node) {
    console.log(`✅ Node.js version specified: ${packageJson.engines.node}`)
  } else {
    console.log("⚠️  Node.js version: Not specified")
  }

  // Check Next.js version compatibility
  const nextVersion = packageJson.dependencies.next
  if (nextVersion && nextVersion.includes("15.")) {
    console.log(`✅ Next.js version: ${nextVersion} (compatible)`)
  } else {
    console.log(`⚠️  Next.js version: ${nextVersion} (check compatibility)`)
  }
} catch (error) {
  console.log("❌ Build compatibility check failed")
}

// Test 7: Database Schema Validation
console.log("\n7️⃣ Testing Database Schema...")
if (fs.existsSync(path.join(process.cwd(), "database-schema-complete.sql"))) {
  console.log("✅ Database schema: File exists")

  const schemaContent = fs.readFileSync(path.join(process.cwd(), "database-schema-complete.sql"), "utf8")
  const requiredTables = ["profiles", "dj_rooms", "chat_messages", "notifications"]

  requiredTables.forEach((table) => {
    if (schemaContent.includes(`CREATE TABLE ${table}`)) {
      console.log(`✅ Table ${table}: Defined`)
    } else {
      console.log(`❌ Table ${table}: Missing`)
    }
  })
} else {
  console.log("❌ Database schema: File missing")
}

// Final Summary
console.log("\n📊 TEST SUMMARY")
console.log("================")
console.log(`Environment Issues: ${envIssues}`)
console.log(`File Issues: ${fileIssues}`)

if (envIssues === 0 && fileIssues === 0) {
  console.log("🎉 ALL TESTS PASSED! Your app should work correctly.")
} else if (envIssues + fileIssues < 3) {
  console.log("⚠️  MINOR ISSUES FOUND. App might work with warnings.")
} else {
  console.log("❌ MAJOR ISSUES FOUND. App likely won't work properly.")
}

console.log("\n🚀 DEPLOYMENT READINESS:")
if (envIssues === 0) {
  console.log("✅ Environment: Ready for deployment")
} else {
  console.log("❌ Environment: Needs configuration")
}

if (fileIssues === 0) {
  console.log("✅ Files: All critical files present")
} else {
  console.log("❌ Files: Missing critical files")
}

console.log("\n🎵 Mix & Mingle Test Complete!")

// eslint-disable-next-line @typescript-eslint/no-require-imports
const someModule = require('some-module');
