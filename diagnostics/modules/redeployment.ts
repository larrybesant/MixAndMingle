import { execSync } from "child_process"

export async function triggerRedeployment() {
  console.log("  Triggering redeployment to production...")

  const results = {
    success: false,
    output: "",
    error: null as string | null,
  }

  try {
    // Commit changes
    execSync("git add .", { stdio: "pipe" })
    execSync('git commit -m "Fix authentication issues - automated by diagnostic tool"', { stdio: "pipe" })

    // Push changes
    execSync("git push", { stdio: "pipe" })

    // Deploy to production
    const deployOutput = execSync("vercel --prod", { stdio: "pipe" }).toString()
    results.output = deployOutput
    results.success = true

    console.log("  ✅ Redeployment triggered successfully")
  } catch (error) {
    console.error("  ❌ Error triggering redeployment:", error)
    results.error = error instanceof Error ? error.message : String(error)
  }

  return results
}
