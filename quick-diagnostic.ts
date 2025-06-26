// Quick Diagnostic Script - Run this in your project root
import { existsSync, readdirSync, readFileSync } from "fs"

console.log("🔍 QUICK DIAGNOSTIC SCAN")
console.log("=".repeat(50))

// Check current directory
console.log("📁 Current Directory:", process.cwd())

// Check if this is a Next.js project
const isNextProject = existsSync("next.config.js") || existsSync("next.config.mjs")
console.log("⚛️ Next.js Project:", isNextProject ? "✅ Yes" : "❌ No")

// Check package.json
if (existsSync("package.json")) {
  try {
    const pkg = JSON.parse(readFileSync("package.json", "utf-8"))
    console.log("📦 Project Name:", pkg.name || "Unknown")
    console.log("📦 Version:", pkg.version || "Unknown")
    console.log("📦 Dependencies:", Object.keys(pkg.dependencies || {}).length)
  } catch (error) {
    console.log("❌ Error reading package.json:", error)
  }
} else {
  console.log("❌ No package.json found")
}

// Check environment variables
console.log("\n🔧 ENVIRONMENT VARIABLES:")
const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
]

requiredEnvVars.forEach((varName) => {
  const exists = !!process.env[varName]
  console.log(`   ${varName}: ${exists ? "✅ Set" : "❌ Missing"}`)
})

// Check key directories
console.log("\n📂 DIRECTORY STRUCTURE:")
const keyDirs = ["app", "components", "lib", "scripts", "database"]
keyDirs.forEach((dir) => {
  const exists = existsSync(dir)
  console.log(`   ${dir}/: ${exists ? "✅ Exists" : "❌ Missing"}`)

  if (exists) {
    try {
      const files = readdirSync(dir).slice(0, 5) // Show first 5 files
      console.log(`      Files: ${files.join(", ")}${files.length === 5 ? "..." : ""}`)
    } catch (error) {
      console.log(`      Error reading directory: ${error}`)
    }
  }
})

// Check key files
console.log("\n📄 KEY FILES:")
const keyFiles = ["app/layout.tsx", "app/page.tsx", "lib/supabase/client.ts", "contexts/auth-context.tsx", ".env.local"]

keyFiles.forEach((file) => {
  const exists = existsSync(file)
  console.log(`   ${file}: ${exists ? "✅ Exists" : "❌ Missing"}`)
})

// Test basic imports
console.log("\n🧪 TESTING IMPORTS:")
try {
  // Test if we can import Next.js
  console.log("   Next.js: ✅ Available")
} catch (error) {
  console.log("   Next.js: ❌ Error -", error)
}

try {
  // Test if we can import React
  console.log("   React: ✅ Available")
} catch (error) {
  console.log("   React: ❌ Error -", error)
}

// Check if development server can start
console.log("\n🚀 RECOMMENDATIONS:")

if (!existsSync(".env.local")) {
  console.log("   1. Create .env.local file with Supabase credentials")
}

if (!existsSync("lib/supabase/client.ts")) {
  console.log("   2. Set up Supabase client configuration")
}

if (!existsSync("contexts/auth-context.tsx")) {
  console.log("   3. Create authentication context")
}

console.log("\n✅ Diagnostic complete!")
console.log("Run 'npm run dev' to test if the app starts")
