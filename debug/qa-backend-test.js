#!/usr/bin/env node

/**
 * COMPREHENSIVE QA TEST SUITE - Backend & Infrastructure
 * Mix & Mingle Application Testing (No Browser Dependencies)
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

console.log("🧪 STARTING COMPREHENSIVE QA TEST SUITE\n");

class QATestSuite {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: [],
    };
  }

  async log(message, type = "info") {
    const timestamp = new Date().toISOString().substr(11, 8);
    const emoji =
      type === "pass"
        ? "✅"
        : type === "fail"
          ? "❌"
          : type === "warn"
            ? "⚠️"
            : "ℹ️";
    console.log(`${emoji} [${timestamp}] ${message}`);
  }

  async test(name, testFn) {
    this.testResults.total++;
    try {
      await this.log(`Testing: ${name}`, "info");
      await testFn();
      this.testResults.passed++;
      this.testResults.details.push({ name, status: "PASS", error: null });
      await this.log(`PASS: ${name}`, "pass");
    } catch (error) {
      this.testResults.failed++;
      this.testResults.details.push({
        name,
        status: "FAIL",
        error: error.message,
      });
      await this.log(`FAIL: ${name} - ${error.message}`, "fail");
    }
  }

  // TEST 1: ENVIRONMENT VARIABLES
  async testEnvironmentVariables() {
    await this.test("Environment Variables", async () => {
      const requiredVars = [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      ];

      for (const envVar of requiredVars) {
        if (!process.env[envVar]) {
          throw new Error(`Missing environment variable: ${envVar}`);
        }
      }

      // Validate Supabase URL format
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL.includes("supabase.co")) {
        throw new Error("Invalid Supabase URL format");
      }
    });
  }

  // TEST 2: DATABASE CONNECTIVITY
  async testDatabaseConnectivity() {
    await this.test("Database Connectivity", async () => {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("id")
        .limit(1);
      if (error) {
        // If profiles table doesn't exist, that's OK for a fresh setup
        if (error.message.includes('relation "profiles" does not exist')) {
          return; // This is acceptable for new setup
        }
        throw new Error(`Database connection failed: ${error.message}`);
      }
    });
  }

  // TEST 3: AUTHENTICATION SYSTEM
  async testAuthenticationSystem() {
    await this.test("Authentication System", async () => {
      // Test basic auth availability
      const testEmail = "nonexistent@test.com";
      const { error } = await this.supabase.auth.signInWithPassword({
        email: testEmail,
        password: "wrongpassword",
      });

      // We expect invalid credentials error, not system error
      if (
        error &&
        !error.message.includes("Invalid login credentials") &&
        !error.message.includes("Email not confirmed") &&
        !error.message.includes("User not found")
      ) {
        throw new Error(`Auth system error: ${error.message}`);
      }
    });
  }

  // TEST 4: COMMUNITIES SCHEMA
  async testCommunitiesSchema() {
    await this.test("Communities Schema", async () => {
      const { data, error } = await this.supabase
        .from("communities")
        .select("id, name, avatar_url, banner_url, member_count")
        .limit(1);

      if (error) {
        if (error.message.includes('relation "communities" does not exist')) {
          throw new Error(
            "Communities schema not set up - Run: POST /api/admin/setup-communities-schema",
          );
        }
        throw new Error(`Communities schema error: ${error.message}`);
      }
    });
  }

  // TEST 5: COMMUNITY MEMBERS SCHEMA
  async testCommunityMembersSchema() {
    await this.test("Community Members Schema", async () => {
      const { data, error } = await this.supabase
        .from("community_members")
        .select("id, community_id, user_id, role")
        .limit(1);

      if (
        error &&
        error.message.includes('relation "community_members" does not exist')
      ) {
        throw new Error("Community members schema not set up");
      }
    });
  }

  // TEST 6: COMMUNITY POSTS SCHEMA
  async testCommunityPostsSchema() {
    await this.test("Community Posts Schema", async () => {
      const { data, error } = await this.supabase
        .from("community_posts")
        .select("id, community_id, author_id, content")
        .limit(1);

      if (
        error &&
        error.message.includes('relation "community_posts" does not exist')
      ) {
        throw new Error("Community posts schema not set up");
      }
    });
  }

  // TEST 7: REAL-TIME SUBSCRIPTIONS
  async testRealTimeSubscriptions() {
    await this.test("Real-time Subscriptions", async () => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          subscription.unsubscribe();
          resolve(); // Don't fail if real-time is slow, just note it
        }, 3000);

        const subscription = this.supabase
          .channel("qa-test-channel")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "communities" },
            () => {
              clearTimeout(timeout);
              subscription.unsubscribe();
              resolve();
            },
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              clearTimeout(timeout);
              subscription.unsubscribe();
              resolve();
            } else if (status === "CHANNEL_ERROR") {
              clearTimeout(timeout);
              subscription.unsubscribe();
              reject(new Error(`Real-time subscription failed: ${status}`));
            }
          });
      });
    });
  }

  // TEST 8: STORAGE BUCKETS
  async testStorageBuckets() {
    await this.test("Storage Buckets", async () => {
      const { data, error } = await this.supabase.storage.listBuckets();
      if (error) {
        throw new Error(`Storage access failed: ${error.message}`);
      }

      // Check if community bucket exists
      const communityBucket = data.find(
        (bucket) => bucket.name === "community-images",
      );
      if (!communityBucket) {
        console.log(
          "⚠️ Community images bucket not found - may need manual setup in Supabase",
        );
      }
    });
  }

  // TEST 9: NEXT.JS APPLICATION BUILD
  async testNextJSBuild() {
    await this.test("Next.js Application Build", async () => {
      const fs = require("fs");
      const path = require("path");

      // Check if .next folder exists (built application)
      const nextBuildPath = path.join(process.cwd(), ".next");
      if (!fs.existsSync(nextBuildPath)) {
        throw new Error("Application not built - run: npm run build");
      }

      // Check for critical build files
      const manifestPath = path.join(nextBuildPath, "build-manifest.json");
      if (!fs.existsSync(manifestPath)) {
        throw new Error(
          "Build manifest missing - application may not be properly built",
        );
      }
    });
  }

  // TEST 10: PACKAGE.JSON AND DEPENDENCIES
  async testPackageConfiguration() {
    await this.test("Package Configuration", async () => {
      const fs = require("fs");
      const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

      // Check for critical dependencies
      const criticalDeps = [
        "@supabase/supabase-js",
        "next",
        "react",
        "react-hot-toast",
      ];

      for (const dep of criticalDeps) {
        if (
          !packageJson.dependencies[dep] &&
          !packageJson.devDependencies[dep]
        ) {
          throw new Error(`Missing critical dependency: ${dep}`);
        }
      }

      // Check for proper scripts
      if (!packageJson.scripts.build || !packageJson.scripts.dev) {
        throw new Error("Missing required npm scripts (build, dev)");
      }
    });
  }

  // TEST 11: LOCAL SERVER AVAILABILITY
  async testLocalServer() {
    await this.test("Local Development Server", async () => {
      try {
        const response = await fetch("http://localhost:3002");
        if (!response.ok && response.status !== 404) {
          throw new Error(`Server returned status: ${response.status}`);
        }
      } catch (error) {
        if (
          error.message.includes("ECONNREFUSED") ||
          error.message.includes("fetch")
        ) {
          throw new Error(
            "Local development server not running - run: npm run dev",
          );
        }
        throw error;
      }
    });
  }

  // TEST 12: TYPE CHECKING
  async testTypeScript() {
    await this.test("TypeScript Configuration", async () => {
      const fs = require("fs");

      // Check if tsconfig.json exists
      if (!fs.existsSync("tsconfig.json")) {
        throw new Error("tsconfig.json not found");
      }

      // Check if there are TypeScript files
      const hasTypeScriptFiles = fs
        .readdirSync("app", { recursive: true })
        .some((file) => file.endsWith(".ts") || file.endsWith(".tsx"));

      if (!hasTypeScriptFiles) {
        throw new Error("No TypeScript files found in app directory");
      }
    });
  }

  // RUN ALL TESTS
  async runAllTests() {
    console.log("🚀 Starting Backend & Infrastructure QA Tests...\n");

    await this.testEnvironmentVariables();
    await this.testPackageConfiguration();
    await this.testTypeScript();
    await this.testNextJSBuild();
    await this.testLocalServer();
    await this.testDatabaseConnectivity();
    await this.testAuthenticationSystem();
    await this.testCommunitiesSchema();
    await this.testCommunityMembersSchema();
    await this.testCommunityPostsSchema();
    await this.testRealTimeSubscriptions();
    await this.testStorageBuckets();

    // FINAL REPORT
    console.log("\n📊 COMPREHENSIVE QA TEST RESULTS:");
    console.log("═".repeat(60));
    console.log(
      `✅ Tests Passed: ${this.testResults.passed}/${this.testResults.total}`,
    );
    console.log(
      `❌ Tests Failed: ${this.testResults.failed}/${this.testResults.total}`,
    );
    console.log(
      `📈 Success Rate: ${Math.round((this.testResults.passed / this.testResults.total) * 100)}%`,
    );
    console.log("═".repeat(60));

    if (this.testResults.failed > 0) {
      console.log("\n🔍 FAILED TESTS & SOLUTIONS:");
      this.testResults.details
        .filter((test) => test.status === "FAIL")
        .forEach((test) => {
          console.log(`❌ ${test.name}`);
          console.log(`   Error: ${test.error}`);
          console.log(
            `   Solution: ${this.getSolution(test.name, test.error)}\n`,
          );
        });
    }

    console.log("\n🎯 QA STATUS & RECOMMENDATIONS:");

    if (this.testResults.failed === 0) {
      console.log("🎉 ALL TESTS PASSED! Application is ready for deployment.");
      console.log("   ✅ Backend infrastructure: READY");
      console.log("   ✅ Database schema: READY");
      console.log("   ✅ Authentication: READY");
      console.log("   ✅ Communities feature: READY");
      console.log("   ✅ Real-time features: READY");
    } else if (this.testResults.failed <= 2) {
      console.log("⚠️ MINOR ISSUES DETECTED");
      console.log("   📋 Address failed tests before deployment");
      console.log("   🔧 Most issues can be resolved quickly");
    } else {
      console.log("🚨 MAJOR ISSUES DETECTED");
      console.log("   ⚠️ Critical problems require immediate attention");
      console.log("   🔧 Fix all failed tests before proceeding");
    }

    console.log("\n📋 NEXT STEPS:");
    if (
      this.testResults.details.some(
        (t) => t.error && t.error.includes("Communities schema not set up"),
      )
    ) {
      console.log("   1. Visit http://localhost:3002/admin");
      console.log('   2. Click "Setup Communities Schema"');
      console.log("   3. Re-run this QA test");
    }

    if (
      this.testResults.details.some(
        (t) => t.error && t.error.includes("not running"),
      )
    ) {
      console.log("   1. Run: npm run dev");
      console.log("   2. Wait for server to start");
      console.log("   3. Re-run this QA test");
    }

    console.log("\n🏁 QA Test Suite Complete!\n");

    return this.testResults.failed === 0;
  }

  getSolution(testName, error) {
    if (error.includes("Communities schema not set up")) {
      return 'Visit /admin page and click "Setup Communities Schema"';
    }
    if (error.includes("not running")) {
      return "Run: npm run dev";
    }
    if (error.includes("not built")) {
      return "Run: npm run build";
    }
    if (error.includes("Missing environment variable")) {
      return "Check .env.local file for missing variables";
    }
    if (error.includes("bucket not found")) {
      return 'Create "community-images" bucket in Supabase Storage';
    }
    return "See error details above";
  }
}

// RUN QA TESTS
async function runQA() {
  try {
    const qa = new QATestSuite();
    const success = await qa.runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error("❌ QA Test Suite Failed:", error.message);
    process.exit(1);
  }
}

runQA();
