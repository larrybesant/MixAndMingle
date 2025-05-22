import { checkFirebaseAuth } from "./modules/firebase-auth-check"
import { analyzeLoginBehavior } from "./modules/login-behavior"
import { checkDatabaseConnections } from "./modules/database-check"
import { verifyFrontendRendering } from "./modules/frontend-check"
import { testApiEndpoints } from "./modules/api-endpoint-check"
import { generateErrorReport } from "./modules/error-report"
import { resetUserData } from "./modules/user-data-reset"
import { applyFixes } from "./modules/apply-fixes"
import { triggerRedeployment } from "./modules/redeployment"
import { writeFileSync } from "fs"

async function runSystemDiagnostic() {
  console.log("🔍 Starting Mix & Mingle System Diagnostic...")
  console.log("=============================================")

  const startTime = Date.now()
  const results: Record<string, any> = {}
  const criticalIssues: string[] = []

  try {
    // Step 1: Check Firebase Authentication System
    console.log("\n🔐 Checking Firebase Authentication System...")
    results.firebaseAuth = await checkFirebaseAuth()
    if (results.firebaseAuth.criticalIssues.length > 0) {
      criticalIssues.push(...results.firebaseAuth.criticalIssues)
    }

    // Step 2: Analyze Login & Forgot Password Behavior
    console.log("\n🔑 Analyzing Login & Forgot Password Behavior...")
    results.loginBehavior = await analyzeLoginBehavior()
    if (results.loginBehavior.criticalIssues.length > 0) {
      criticalIssues.push(...results.loginBehavior.criticalIssues)
    }

    // Step 3: Check Database Connections
    console.log("\n💾 Checking Database Connections...")
    results.databaseConnections = await checkDatabaseConnections()
    if (results.databaseConnections.criticalIssues.length > 0) {
      criticalIssues.push(...results.databaseConnections.criticalIssues)
    }

    // Step 4: Verify Frontend Rendering
    console.log("\n🖥️ Verifying Frontend Rendering...")
    results.frontendRendering = await verifyFrontendRendering()
    if (results.frontendRendering.criticalIssues.length > 0) {
      criticalIssues.push(...results.frontendRendering.criticalIssues)
    }

    // Step 5: Test API Endpoints
    console.log("\n🌐 Testing API Endpoints...")
    results.apiEndpoints = await testApiEndpoints()
    if (results.apiEndpoints.criticalIssues.length > 0) {
      criticalIssues.push(...results.apiEndpoints.criticalIssues)
    }

    // Step 6: Generate Error Report
    console.log("\n📊 Generating Error Report...")
    results.errorReport = await generateErrorReport(results)

    // Step 7: Reset User Data if necessary
    if (criticalIssues.some((issue) => issue.includes("corrupted authentication"))) {
      console.log("\n⚠️ Corrupted authentication records detected. Resetting affected user data...")
      results.userDataReset = await resetUserData()
    }

    // Step 8: Apply Fixes
    console.log("\n🔧 Applying Fixes...")
    results.fixes = await applyFixes(results, criticalIssues)

    // Step 9: Trigger Redeployment if fixes were applied
    if (results.fixes.fixesApplied) {
      console.log("\n🚀 Triggering Redeployment...")
      results.redeployment = await triggerRedeployment()
    }
  } catch (error) {
    console.error("❌ Error during diagnostic:", error)
    results.error = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }
  }

  // Calculate execution time
  const executionTime = (Date.now() - startTime) / 1000
  results.meta = {
    executionTime,
    timestamp: new Date().toISOString(),
    criticalIssues,
  }

  // Save results to file
  const reportPath = `./diagnostic-report-${new Date().toISOString().replace(/:/g, "-")}.json`
  writeFileSync(reportPath, JSON.stringify(results, null, 2))

  console.log("\n=============================================")
  console.log(`✅ Diagnostic completed in ${executionTime.toFixed(2)} seconds`)
  console.log(`📝 Report saved to ${reportPath}`)

  if (criticalIssues.length > 0) {
    console.log("\n⚠️ Critical Issues Detected:")
    criticalIssues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`)
    })
  } else {
    console.log("\n✅ No critical issues detected")
  }

  return results
}

// Run the diagnostic
runSystemDiagnostic().catch(console.error)
