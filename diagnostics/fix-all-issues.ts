import { execSync } from "child_process"

async function fixAllIssues() {
  console.log("🔧 Fixing all identified issues...")

  try {
    // Fix auth-context file
    console.log("\n1. Fixing auth-context file...")
    execSync("node fix-auth-context-file.ts", { stdio: "inherit" })

    // Fix layout file
    console.log("\n2. Fixing layout file...")
    execSync("node fix-layout-file.ts", { stdio: "inherit" })

    // Fix VAPID key issue
    console.log("\n3. Fixing VAPID key issue...")
    execSync("node fix-vapid-key-issue.ts", { stdio: "inherit" })

    console.log("\n✅ All fixes applied successfully")

    // Ask if user wants to commit and deploy
    console.log("\nDo you want to commit these changes and deploy to production? (y/n)")
    process.stdin.once("data", (data) => {
      const input = data.toString().trim().toLowerCase()

      if (input === "y" || input === "yes") {
        console.log("\n🚀 Committing changes and deploying to production...")

        try {
          // Commit changes
          execSync("git add .", { stdio: "inherit" })
          execSync('git commit -m "Fix authentication issues - automated by diagnostic tool"', { stdio: "inherit" })

          // Push changes
          execSync("git push", { stdio: "inherit" })

          // Deploy to production
          execSync("vercel --prod", { stdio: "inherit" })

          console.log("\n✅ Deployment completed successfully")
        } catch (error) {
          console.error("\n❌ Error during deployment:", error)
        }
      } else {
        console.log('\nDeployment skipped. You can deploy manually with "vercel --prod"')
      }

      process.exit(0)
    })
  } catch (error) {
    console.error("❌ Error fixing issues:", error)
    process.exit(1)
  }
}

// Run the fix
fixAllIssues().catch(console.error)
