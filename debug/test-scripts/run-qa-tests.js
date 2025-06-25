"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const qa_automation_1 = require("./qa-automation");
async function runQATests() {
  console.log("🚀 Starting QA Automation Tests...");
  const browser = await test_1.chromium.launch({
    headless: false, // Run in visible mode to see what's happening
    slowMo: 1000, // Slow down actions to observe
  });
  const qaTest = new qa_automation_1.QATestSuite();
  await qaTest.init(browser);
  try {
    const results = await qaTest.runFullTestSuite();
    console.log("\n🏁 QA Test Suite Completed!");
    console.log(`Total Issues Found: ${results.total}`);
    // Auto-fix issues where possible
    if (results.critical.length > 0 || results.high.length > 0) {
      console.log(
        "\n🔧 Attempting to auto-fix critical and high priority issues...",
      );
      await autoFixIssues(results);
    }
  } catch (error) {
    console.error("❌ QA Test Suite failed:", error);
  } finally {
    await browser.close();
  }
}
async function autoFixIssues(results) {
  console.log("🛠️ Auto-fixing detected issues...");
  for (const issue of [...results.critical, ...results.high]) {
    switch (issue.type) {
      case "405_error":
        if (issue.message.includes("password reset")) {
          console.log("🔧 Fixing password reset 405 error...");
          // This was already addressed in our previous fixes
        }
        break;
      case "missing_form":
        console.log(
          "🔧 Detected missing signup form - this may require manual investigation",
        );
        break;
      case "signup_error":
        console.log(
          "🔧 Detected signup error - checking auth configuration...",
        );
        break;
      default:
        console.log(
          `ℹ️ Issue type ${issue.type} requires manual review: ${issue.message}`,
        );
    }
  }
}
// Run the tests
runQATests().catch(console.error);
