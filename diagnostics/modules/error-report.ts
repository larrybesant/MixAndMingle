import { writeFileSync } from "fs"

export async function generateErrorReport(results: Record<string, any>) {
  console.log("  Generating error report...")

  const errorReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalIssues: 0,
      criticalIssues: 0,
      warningIssues: 0,
    },
    criticalIssues: [] as string[],
    warningIssues: [] as string[],
    detailedResults: results,
  }

  // Collect all critical issues
  for (const module in results) {
    if (results[module] && Array.isArray(results[module].criticalIssues)) {
      errorReport.criticalIssues.push(...results[module].criticalIssues)
    }
  }

  // Add warning issues based on results
  if (results.firebaseAuth && !results.firebaseAuth.firebaseAdminInitialized) {
    errorReport.warningIssues.push("Firebase Admin SDK is not initialized")
  }

  if (results.loginBehavior && results.loginBehavior.loginPerformance.timeouts) {
    errorReport.warningIssues.push("Login endpoint has slow response times")
  }

  if (results.databaseConnections && !results.databaseConnections.redisConnected && process.env.REDIS_URL) {
    errorReport.warningIssues.push("Redis connection failed")
  }

  if (results.frontendRendering && results.frontendRendering.hydrationErrors) {
    errorReport.warningIssues.push("Frontend hydration errors detected")
  }

  // Update summary counts
  errorReport.summary.criticalIssues = errorReport.criticalIssues.length
  errorReport.summary.warningIssues = errorReport.warningIssues.length
  errorReport.summary.totalIssues = errorReport.criticalIssues.length + errorReport.warningIssues.length

  // Save error report to file
  const reportPath = `./error-report-${new Date().toISOString().replace(/:/g, "-")}.json`
  writeFileSync(reportPath, JSON.stringify(errorReport, null, 2))

  console.log(`  ✅ Error report generated and saved to ${reportPath}`)
  console.log(
    `  📊 Summary: ${errorReport.summary.criticalIssues} critical issues, ${errorReport.summary.warningIssues} warnings`,
  )

  return errorReport
}
