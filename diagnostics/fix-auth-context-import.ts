import { readFileSync, writeFileSync, existsSync } from "fs"

function fixAuthContextImport() {
  console.log("🔧 Fixing auth-context import issue...")

  try {
    // Check if layout.tsx exists
    if (existsSync("./app/layout.tsx")) {
      let layoutContent = readFileSync("./app/layout.tsx", "utf8")

      // Fix the import statement
      const originalContent = layoutContent
      layoutContent = layoutContent.replace(
        /import\s+{\s*AuthProvider\s*}\s+from\s+['"]@\/lib\/auth\/auth-context['"]/,
        "import { AuthProvider } from '@/lib/auth/auth-context.tsx'",
      )

      // Check if the content was actually changed
      if (layoutContent === originalContent) {
        console.log("No changes needed to import statement. Trying alternative fix...")

        // Try creating an index.ts file in the auth directory
        if (existsSync("./lib/auth/auth-context.tsx")) {
          const indexContent = `export * from './auth-context.tsx';\n`
          writeFileSync("./lib/auth/index.ts", indexContent)

          // Update the import in layout.tsx
          layoutContent = originalContent.replace(
            /import\s+{\s*AuthProvider\s*}\s+from\s+['"]@\/lib\/auth\/auth-context['"]/,
            "import { AuthProvider } from '@/lib/auth'",
          )

          writeFileSync("./app/layout.tsx", layoutContent)
          console.log("✅ Created index.ts in lib/auth and updated import in app/layout.tsx")
        } else {
          console.log("❌ Could not find lib/auth/auth-context.tsx")
          return false
        }
      } else {
        // Write the fixed content back
        writeFileSync("./app/layout.tsx", layoutContent)
        console.log("✅ Fixed auth-context import in app/layout.tsx")
      }

      return true
    } else {
      console.log("❌ Could not find app/layout.tsx")
      return false
    }
  } catch (error) {
    console.error("❌ Error fixing auth-context import:", error)
    return false
  }
}

// Run the fix
const success = fixAuthContextImport()
console.log(success ? "✅ Fix completed successfully" : "❌ Fix failed")
