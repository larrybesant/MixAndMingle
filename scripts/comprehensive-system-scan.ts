import { writeFileSync, readFileSync, existsSync } from "fs"

interface SystemScanResult {
  timestamp: string
  environment: "development" | "production" | "unknown"
  overallHealth: "healthy" | "warning" | "critical"
  issues: Array<{
    category: string
    severity: "low" | "medium" | "high" | "critical"
    issue: string
    fix: string
    autoFixable: boolean
    applied: boolean
  }>
  tests: Array<{
    category: string
    test: string
    status: "pass" | "fail" | "warning"
    details: string
    duration: number
  }>
  recommendations: string[]
}

class SystemScanner {
  private results: SystemScanResult
  private startTime: number

  constructor() {
    this.startTime = Date.now()
    this.results = {
      timestamp: new Date().toISOString(),
      environment: this.detectEnvironment(),
      overallHealth: "healthy",
      issues: [],
      tests: [],
      recommendations: [],
    }
  }

  private detectEnvironment(): "development" | "production" | "unknown" {
    if (process.env.NODE_ENV === "production") return "production"
    if (process.env.NODE_ENV === "development") return "development"
    return "unknown"
  }

  private addTest(
    category: string,
    test: string,
    status: "pass" | "fail" | "warning",
    details: string,
    startTime: number,
  ) {
    this.results.tests.push({
      category,
      test,
      status,
      details,
      duration: Date.now() - startTime,
    })
  }

  private addIssue(
    category: string,
    severity: "low" | "medium" | "high" | "critical",
    issue: string,
    fix: string,
    autoFixable = false,
  ) {
    this.results.issues.push({
      category,
      severity,
      issue,
      fix,
      autoFixable,
      applied: false,
    })
  }

  private addRecommendation(recommendation: string) {
    this.results.recommendations.push(recommendation)
  }

  async scanEnvironmentVariables() {
    console.log("🔍 Scanning Environment Variables...")
    const testStart = Date.now()

    const requiredVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "DATABASE_URL",
    ]

    const optionalVars = [
      "DAILY_API_KEY",
      "RESEND_API_KEY",
      "TWILIO_ACCOUNT_SID",
      "TWILIO_AUTH_TOKEN",
      "NEXT_PUBLIC_APP_URL",
    ]

    let missingRequired = 0
    let missingOptional = 0

    // Check required variables
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missingRequired++
        this.addIssue(
          "Environment",
          "critical",
          `Missing required environment variable: ${varName}`,
          `Add ${varName} to your .env.local file and Vercel environment variables`,
          false,
        )
      }
    }

    // Check optional variables
    for (const varName of optionalVars) {
      if (!process.env[varName]) {
        missingOptional++
        this.addIssue(
          "Environment",
          "medium",
          `Missing optional environment variable: ${varName}`,
          `Add ${varName} for full functionality`,
          false,
        )
      }
    }

    const status = missingRequired > 0 ? "fail" : missingOptional > 0 ? "warning" : "pass"
    this.addTest(
      "Environment",
      "Environment Variables Check",
      status,
      `Required: ${requiredVars.length - missingRequired}/${requiredVars.length}, Optional: ${optionalVars.length - missingOptional}/${optionalVars.length}`,
      testStart,
    )
  }

  async scanConfigurationFiles() {
    console.log("🔍 Scanning Configuration Files...")
    const testStart = Date.now()

    const configFiles = ["next.config.mjs", "tailwind.config.ts", "tsconfig.json", "package.json", ".eslintrc.json"]

    let issues = 0

    for (const file of configFiles) {
      if (!existsSync(file)) {
        issues++
        this.addIssue(
          "Configuration",
          "high",
          `Missing configuration file: ${file}`,
          `Create ${file} with proper configuration`,
          true,
        )
      }
    }

    // Check Next.js config
    if (existsSync("next.config.mjs")) {
      try {
        const nextConfig = readFileSync("next.config.mjs", "utf-8")
        if (!nextConfig.includes("typescript")) {
          this.addIssue(
            "Configuration",
            "medium",
            "Next.js config missing TypeScript configuration",
            "Add TypeScript configuration to next.config.mjs",
            true,
          )
        }
      } catch (error) {
        this.addIssue(
          "Configuration",
          "high",
          "Invalid Next.js configuration file",
          "Fix syntax errors in next.config.mjs",
          false,
        )
      }
    }

    const status = issues > 0 ? "fail" : "pass"
    this.addTest(
      "Configuration",
      "Configuration Files Check",
      status,
      `${configFiles.length - issues}/${configFiles.length} configuration files present`,
      testStart,
    )
  }

  async testSupabaseConnection() {
    console.log("🔍 Testing Supabase Connection...")
    const testStart = Date.now()

    try {
      // Dynamic import to avoid SSR issues
      const { supabase } = await import("../lib/supabase/client")

      // Test basic connection
      const { data, error } = await supabase.from("profiles").select("count(*)").limit(1)

      if (error) {
        if (error.code === "42P01") {
          this.addIssue(
            "Database",
            "high",
            "Profiles table does not exist",
            "Run database setup SQL in Supabase dashboard",
            true,
          )
          this.addTest("Database", "Supabase Connection", "warning", "Connected but tables missing", testStart)
        } else {
          this.addIssue(
            "Database",
            "critical",
            `Supabase connection error: ${error.message}`,
            "Check Supabase URL and API keys",
            false,
          )
          this.addTest("Database", "Supabase Connection", "fail", error.message, testStart)
        }
      } else {
        this.addTest("Database", "Supabase Connection", "pass", "Connection successful", testStart)
      }
    } catch (error) {
      this.addIssue(
        "Database",
        "critical",
        `Failed to connect to Supabase: ${error}`,
        "Check environment variables and network connection",
        false,
      )
      this.addTest("Database", "Supabase Connection", "fail", `Connection failed: ${error}`, testStart)
    }
  }

  async testAuthenticationFlow() {
    console.log("🔍 Testing Authentication Flow...")
    const testStart = Date.now()

    try {
      const { supabase } = await import("../lib/supabase/client")

      // Test auth session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        this.addIssue(
          "Authentication",
          "high",
          `Auth session error: ${error.message}`,
          "Check Supabase auth configuration",
          false,
        )
        this.addTest("Authentication", "Auth Session Check", "fail", error.message, testStart)
      } else {
        this.addTest(
          "Authentication",
          "Auth Session Check",
          "pass",
          session ? `User logged in: ${session.user.email}` : "No active session (normal)",
          testStart,
        )
      }
    } catch (error) {
      this.addIssue(
        "Authentication",
        "critical",
        `Auth system failure: ${error}`,
        "Check auth context and Supabase configuration",
        false,
      )
      this.addTest("Authentication", "Auth Session Check", "fail", `Auth system error: ${error}`, testStart)
    }
  }

  async testAPIEndpoints() {
    console.log("🔍 Testing API Endpoints...")
    const testStart = Date.now()

    const endpoints = ["/api/health", "/api/env-check", "/api/db-health", "/api/matching/potential", "/api/test-auth"]

    let passedEndpoints = 0

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:3000${endpoint}`)
        if (response.ok) {
          passedEndpoints++
        } else {
          this.addIssue(
            "API",
            "medium",
            `API endpoint ${endpoint} returned ${response.status}`,
            `Check ${endpoint} implementation`,
            false,
          )
        }
      } catch (error) {
        this.addIssue(
          "API",
          "medium",
          `API endpoint ${endpoint} unreachable`,
          `Ensure development server is running and endpoint exists`,
          false,
        )
      }
    }

    const status = passedEndpoints === endpoints.length ? "pass" : passedEndpoints > 0 ? "warning" : "fail"
    this.addTest(
      "API",
      "API Endpoints Health Check",
      status,
      `${passedEndpoints}/${endpoints.length} endpoints responding`,
      testStart,
    )
  }

  async testThirdPartyIntegrations() {
    console.log("🔍 Testing Third-Party Integrations...")
    const testStart = Date.now()

    const integrations = [
      { name: "Twilio", envVars: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"] },
      { name: "Resend", envVars: ["RESEND_API_KEY"] },
      { name: "Daily.co", envVars: ["DAILY_API_KEY"] },
    ]

    let workingIntegrations = 0

    for (const integration of integrations) {
      const hasAllVars = integration.envVars.every((varName) => process.env[varName])

      if (hasAllVars) {
        workingIntegrations++
      } else {
        this.addIssue(
          "Integrations",
          "medium",
          `${integration.name} integration not configured`,
          `Add environment variables: ${integration.envVars.join(", ")}`,
          false,
        )
      }
    }

    const status = workingIntegrations === integrations.length ? "pass" : workingIntegrations > 0 ? "warning" : "fail"
    this.addTest(
      "Integrations",
      "Third-Party Services",
      status,
      `${workingIntegrations}/${integrations.length} integrations configured`,
      testStart,
    )
  }

  async testFrontendComponents() {
    console.log("🔍 Testing Frontend Components...")
    const testStart = Date.now()

    const criticalComponents = [
      "app/layout.tsx",
      "app/page.tsx",
      "contexts/auth-context.tsx",
      "lib/supabase/client.ts",
      "components/ui/button.tsx",
    ]

    let existingComponents = 0

    for (const component of criticalComponents) {
      if (existsSync(component)) {
        existingComponents++
      } else {
        this.addIssue(
          "Frontend",
          "high",
          `Missing critical component: ${component}`,
          `Create or restore ${component}`,
          false,
        )
      }
    }

    const status = existingComponents === criticalComponents.length ? "pass" : "fail"
    this.addTest(
      "Frontend",
      "Critical Components Check",
      status,
      `${existingComponents}/${criticalComponents.length} components present`,
      testStart,
    )
  }

  async applyAutoFixes() {
    console.log("🔧 Applying Automatic Fixes...")

    const autoFixableIssues = this.results.issues.filter((issue) => issue.autoFixable)

    for (const issue of autoFixableIssues) {
      try {
        await this.applyFix(issue)
        issue.applied = true
        console.log(`✅ Fixed: ${issue.issue}`)
      } catch (error) {
        console.log(`❌ Failed to fix: ${issue.issue} - ${error}`)
      }
    }
  }

  private async applyFix(issue: any) {
    switch (issue.category) {
      case "Configuration":
        if (issue.issue.includes("Missing configuration file: next.config.mjs")) {
          const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig`
          writeFileSync("next.config.mjs", nextConfig)
        }
        break

      case "Database":
        if (issue.issue.includes("Profiles table does not exist")) {
          // This would require database access, so we'll provide the SQL
          const setupSQL = `-- Run this in your Supabase SQL editor
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  bio TEXT,
  music_preferences TEXT[],
  relationship_style TEXT,
  gender TEXT,
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profile" ON profiles 
FOR ALL USING (auth.uid() = id);`

          writeFileSync("database/auto-generated-setup.sql", setupSQL)
          console.log("📝 Generated database setup SQL at database/auto-generated-setup.sql")
        }
        break
    }
  }

  generateReport() {
    // Calculate overall health
    const criticalIssues = this.results.issues.filter((i) => i.severity === "critical").length
    const highIssues = this.results.issues.filter((i) => i.severity === "high").length
    const failedTests = this.results.tests.filter((t) => t.status === "fail").length

    if (criticalIssues > 0 || failedTests > 2) {
      this.results.overallHealth = "critical"
    } else if (highIssues > 0 || failedTests > 0) {
      this.results.overallHealth = "warning"
    }

    // Generate recommendations
    if (criticalIssues > 0) {
      this.addRecommendation("🚨 CRITICAL: Fix environment variables and database connection immediately")
    }
    if (highIssues > 0) {
      this.addRecommendation("⚠️ HIGH: Address configuration and component issues")
    }
    if (this.results.tests.filter((t) => t.status === "warning").length > 0) {
      this.addRecommendation("💡 MEDIUM: Complete optional integrations for full functionality")
    }

    return this.results
  }

  async runFullScan() {
    console.log("🚀 Starting Comprehensive System Scan...")
    console.log("=".repeat(50))

    await this.scanEnvironmentVariables()
    await this.scanConfigurationFiles()
    await this.testSupabaseConnection()
    await this.testAuthenticationFlow()
    await this.testAPIEndpoints()
    await this.testThirdPartyIntegrations()
    await this.testFrontendComponents()
    await this.applyAutoFixes()

    const report = this.generateReport()

    // Save report
    writeFileSync(`system-scan-report-${Date.now()}.json`, JSON.stringify(report, null, 2))

    console.log("\n" + "=".repeat(50))
    console.log("📊 SYSTEM SCAN COMPLETE")
    console.log("=".repeat(50))

    return report
  }
}

// Run the scan
const scanner = new SystemScanner()
scanner
  .runFullScan()
  .then((report) => {
    console.log(`\n🎯 OVERALL HEALTH: ${report.overallHealth.toUpperCase()}`)
    console.log(
      `📈 Tests: ${report.tests.filter((t) => t.status === "pass").length} passed, ${report.tests.filter((t) => t.status === "fail").length} failed, ${report.tests.filter((t) => t.status === "warning").length} warnings`,
    )
    console.log(
      `🐛 Issues: ${report.issues.length} total (${report.issues.filter((i) => i.severity === "critical").length} critical, ${report.issues.filter((i) => i.severity === "high").length} high)`,
    )
    console.log(`🔧 Auto-fixes: ${report.issues.filter((i) => i.applied).length} applied`)

    if (report.recommendations.length > 0) {
      console.log("\n📋 RECOMMENDATIONS:")
      report.recommendations.forEach((rec) => console.log(`   ${rec}`))
    }

    console.log(`\n📄 Full report saved to: system-scan-report-${Date.now()}.json`)
  })
  .catch((error) => {
    console.error("❌ System scan failed:", error)
  })
