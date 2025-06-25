#!/usr/bin/env node

/**
 * COMPREHENSIVE QA TEST SUITE
 * Mix & Mingle Full Application Testing
 */

const { createClient } = require("@supabase/supabase-js");
const puppeteer = require("puppeteer");
require("dotenv").config({ path: ".env.local" });

console.log("🧪 STARTING COMPREHENSIVE QA TEST SUITE\n");

class QATestSuite {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
    this.browser = null;
    this.page = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: [],
    };
  }

  async log(message, type = "info") {
    const timestamp = new Date().toISOString();
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
      await this.log(`✅ PASS: ${name}`, "pass");
    } catch (error) {
      this.testResults.failed++;
      this.testResults.details.push({
        name,
        status: "FAIL",
        error: error.message,
      });
      await this.log(`❌ FAIL: ${name} - ${error.message}`, "fail");
    }
  }

  // TEST 1: DATABASE CONNECTIVITY
  async testDatabaseConnectivity() {
    await this.test("Database Connectivity", async () => {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("id")
        .limit(1);
      if (error)
        throw new Error(`Database connection failed: ${error.message}`);
    });
  }

  // TEST 2: AUTHENTICATION SYSTEM
  async testAuthenticationSystem() {
    await this.test("Authentication System Ready", async () => {
      // Test if auth endpoints are accessible
      const testEmail = "test@example.com";
      const { error } = await this.supabase.auth.signInWithPassword({
        email: testEmail,
        password: "wrong-password",
      });
      // We expect this to fail with invalid credentials, not system error
      if (
        error &&
        !error.message.includes("Invalid login credentials") &&
        !error.message.includes("Email not confirmed")
      ) {
        throw new Error(`Auth system error: ${error.message}`);
      }
    });
  }

  // TEST 3: COMMUNITIES SCHEMA
  async testCommunitiesSchema() {
    await this.test("Communities Database Schema", async () => {
      const { data, error } = await this.supabase
        .from("communities")
        .select("id, name, avatar_url, banner_url")
        .limit(1);

      if (
        error &&
        error.message.includes('relation "communities" does not exist')
      ) {
        throw new Error(
          "Communities schema not set up - visit /admin to set up",
        );
      }
      if (error) throw new Error(`Communities schema error: ${error.message}`);
    });
  }

  // TEST 4: REAL-TIME SUBSCRIPTIONS
  async testRealTimeSubscriptions() {
    await this.test("Real-time Subscriptions", async () => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          subscription.unsubscribe();
          reject(new Error("Real-time subscription timeout"));
        }, 5000);

        const subscription = this.supabase
          .channel("test-channel")
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
            } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
              clearTimeout(timeout);
              subscription.unsubscribe();
              reject(new Error(`Real-time subscription failed: ${status}`));
            }
          });
      });
    });
  }

  // TEST 5: STORAGE BUCKETS
  async testStorageBuckets() {
    await this.test("Storage Buckets Configuration", async () => {
      const { data, error } = await this.supabase.storage.listBuckets();
      if (error) throw new Error(`Storage access failed: ${error.message}`);

      const communityBucket = data.find(
        (bucket) => bucket.name === "community-images",
      );
      if (!communityBucket) {
        throw new Error("Community images bucket not found - may need setup");
      }
    });
  }

  // TEST 6: WEB APPLICATION FRONTEND
  async testFrontendApplication() {
    await this.test("Frontend Application Loading", async () => {
      this.browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      this.page = await this.browser.newPage();

      await this.page.goto("http://localhost:3002", {
        waitUntil: "networkidle0",
        timeout: 10000,
      });

      const title = await this.page.title();
      if (!title || title.includes("Error")) {
        throw new Error(`Frontend not loading properly. Title: ${title}`);
      }
    });
  }

  // TEST 7: NAVIGATION AND ROUTING
  async testNavigationRouting() {
    await this.test("Navigation and Routing", async () => {
      if (!this.page) throw new Error("Frontend not loaded");

      // Test main navigation
      const routes = ["/login", "/signup", "/communities", "/dashboard"];

      for (const route of routes) {
        await this.page.goto(`http://localhost:3002${route}`, {
          waitUntil: "networkidle0",
          timeout: 5000,
        });

        const url = this.page.url();
        if (!url.includes(route) && !url.includes("/login")) {
          throw new Error(`Route ${route} not accessible`);
        }
      }
    });
  }

  // TEST 8: COMMUNITIES FUNCTIONALITY
  async testCommunitiesFunctionality() {
    await this.test("Communities Page Functionality", async () => {
      if (!this.page) throw new Error("Frontend not loaded");

      await this.page.goto("http://localhost:3002/communities", {
        waitUntil: "networkidle0",
        timeout: 10000,
      });

      // Check for communities page elements
      const createButton = await this.page.$(
        '[data-testid="create-community"], button:contains("Create Community")',
      );
      const searchInput = await this.page.$(
        'input[type="search"], input[placeholder*="search"]',
      );

      if (!createButton && !searchInput) {
        // Check if we're redirected to login (which is expected)
        const currentUrl = this.page.url();
        if (!currentUrl.includes("/login") && !currentUrl.includes("/signup")) {
          throw new Error(
            "Communities page elements not found and not redirected to auth",
          );
        }
      }
    });
  }

  // TEST 9: ADMIN FUNCTIONALITY
  async testAdminFunctionality() {
    await this.test("Admin Page Accessibility", async () => {
      if (!this.page) throw new Error("Frontend not loaded");

      await this.page.goto("http://localhost:3002/admin", {
        waitUntil: "networkidle0",
        timeout: 10000,
      });

      // Check if admin page loads
      const pageContent = await this.page.content();
      if (pageContent.includes("404") || pageContent.includes("Not Found")) {
        throw new Error("Admin page not accessible");
      }
    });
  }

  // TEST 10: API ENDPOINTS
  async testApiEndpoints() {
    await this.test("API Endpoints Health", async () => {
      const endpoints = ["/api/health", "/api/admin/setup-communities-schema"];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`http://localhost:3002${endpoint}`, {
            method: endpoint.includes("setup") ? "POST" : "GET",
          });

          if (
            !response.ok &&
            response.status !== 401 &&
            response.status !== 403
          ) {
            throw new Error(
              `API endpoint ${endpoint} returned ${response.status}`,
            );
          }
        } catch (error) {
          if (error.message.includes("fetch")) {
            throw new Error(`API endpoint ${endpoint} not reachable`);
          }
          throw error;
        }
      }
    });
  }

  // TEST 11: PERFORMANCE CHECK
  async testPerformance() {
    await this.test("Performance Metrics", async () => {
      if (!this.page) throw new Error("Frontend not loaded");

      await this.page.goto("http://localhost:3002", {
        waitUntil: "networkidle0",
        timeout: 10000,
      });

      const metrics = await this.page.metrics();

      // Check for reasonable performance metrics
      if (metrics.JSHeapUsedSize > 50 * 1024 * 1024) {
        // 50MB
        throw new Error(
          `High memory usage: ${Math.round(metrics.JSHeapUsedSize / 1024 / 1024)}MB`,
        );
      }

      if (metrics.ScriptDuration > 5000) {
        // 5 seconds
        throw new Error(`Slow script execution: ${metrics.ScriptDuration}ms`);
      }
    });
  }

  // CLEANUP
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  // RUN ALL TESTS
  async runAllTests() {
    console.log("🚀 Starting Full QA Test Suite...\n");

    try {
      await this.testDatabaseConnectivity();
      await this.testAuthenticationSystem();
      await this.testCommunitiesSchema();
      await this.testRealTimeSubscriptions();
      await this.testStorageBuckets();
      await this.testFrontendApplication();
      await this.testNavigationRouting();
      await this.testCommunitiesFunctionality();
      await this.testAdminFunctionality();
      await this.testApiEndpoints();
      await this.testPerformance();
    } finally {
      await this.cleanup();
    }

    // FINAL REPORT
    console.log("\n📊 QA TEST RESULTS:");
    console.log("═".repeat(50));
    console.log(`✅ Tests Passed: ${this.testResults.passed}`);
    console.log(`❌ Tests Failed: ${this.testResults.failed}`);
    console.log(`📊 Total Tests: ${this.testResults.total}`);
    console.log(
      `📈 Success Rate: ${Math.round((this.testResults.passed / this.testResults.total) * 100)}%`,
    );
    console.log("═".repeat(50));

    if (this.testResults.failed > 0) {
      console.log("\n🔍 FAILED TEST DETAILS:");
      this.testResults.details
        .filter((test) => test.status === "FAIL")
        .forEach((test) => {
          console.log(`❌ ${test.name}: ${test.error}`);
        });
    }

    console.log("\n🎯 QA RECOMMENDATIONS:");
    if (this.testResults.failed === 0) {
      console.log(
        "🎉 All tests passed! Application is ready for production deployment.",
      );
    } else if (this.testResults.failed <= 2) {
      console.log(
        "⚠️ Minor issues detected. Address failed tests before deployment.",
      );
    } else {
      console.log(
        "🚨 Major issues detected. Requires immediate attention before deployment.",
      );
    }

    console.log("\n🏁 QA Test Suite Complete!");

    // Exit with appropriate code
    process.exit(this.testResults.failed > 0 ? 1 : 0);
  }
}

// Install puppeteer if not available and run tests
async function runQA() {
  try {
    const qa = new QATestSuite();
    await qa.runAllTests();
  } catch (error) {
    console.error("❌ QA Test Suite Failed:", error.message);
    process.exit(1);
  }
}

// Check if puppeteer is available
try {
  require("puppeteer");
  runQA();
} catch (error) {
  console.log("📦 Installing puppeteer for frontend testing...");
  const { exec } = require("child_process");
  exec("npm install puppeteer --save-dev", (error) => {
    if (error) {
      console.log("⚠️ Puppeteer not available, skipping frontend tests");
      // Run without frontend tests
      const qa = new QATestSuite();
      qa.runAllTests().catch(console.error);
    } else {
      console.log("✅ Puppeteer installed, running full test suite");
      runQA();
    }
  });
}
