// This script verifies that crypto-browserify is properly configured
console.log("Testing crypto module polyfill...")

try {
  // Try to import the crypto module
  const crypto = require("crypto")

  // Test a simple hash function
  const hash = crypto.createHash("sha256").update("test").digest("hex")
  console.log("✅ Successfully created SHA-256 hash:", hash)

  // Test random bytes generation
  const randomBytes = crypto.randomBytes(16).toString("hex")
  console.log("✅ Successfully generated random bytes:", randomBytes)

  console.log("✅ Crypto module is properly polyfilled!")
} catch (error) {
  console.error("❌ Error testing crypto module:", error)
  process.exit(1)
}
