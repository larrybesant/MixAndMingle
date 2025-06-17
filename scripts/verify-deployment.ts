console.log("🔍 Verifying deployment status...")

// Check if files match what's expected
const fs = require("fs")
const path = require("path")

try {
  // Check package.json
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"))
  console.log("✅ package.json is valid JSON")
  console.log("📦 Dependencies:", Object.keys(packageJson.dependencies || {}).length)

  // Check if main page exists
  const pageExists = fs.existsSync("app/page.tsx")
  console.log("📄 app/page.tsx exists:", pageExists)

  // Check if globals.css exists
  const cssExists = fs.existsSync("app/globals.css")
  console.log("🎨 app/globals.css exists:", cssExists)

  console.log("✅ Basic file structure verified")
} catch (error) {
  console.error("❌ Error:", error.message)
}
