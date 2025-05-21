/**
 * This script verifies that the crypto-browserify package is installed
 * and properly configured before building the application.
 */

const fs = require("fs")
const path = require("path")

console.log("Verifying crypto-browserify installation...")

// Check if crypto-browserify is installed
try {
  const cryptoPath = require.resolve("crypto-browserify")
  console.log("✅ crypto-browserify found at:", cryptoPath)
} catch (error) {
  console.error("❌ crypto-browserify is not installed!")
  console.error("Please run: pnpm add crypto-browserify")
  process.exit(1)
}

// Check if next.config.js has the proper webpack configuration
const nextConfigPath = path.join(process.cwd(), "next.config.js")
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, "utf8")

  if (!nextConfig.includes("crypto-browserify") || !nextConfig.includes("resolve.fallback")) {
    console.warn("⚠️ next.config.js might not have proper webpack configuration for crypto-browserify")
    console.warn("Please ensure your next.config.js includes the proper webpack fallback configuration")
  } else {
    console.log("✅ next.config.js appears to have proper webpack configuration")
  }
} else {
  console.error("❌ next.config.js not found!")
  process.exit(1)
}

// Check for other required polyfills
const requiredPolyfills = [
  "stream-browserify",
  "buffer",
  "path-browserify",
  "stream-http",
  "https-browserify",
  "os-browserify",
  "process",
  "util",
]

const missingPolyfills = []

for (const polyfill of requiredPolyfills) {
  try {
    require.resolve(polyfill)
  } catch (error) {
    missingPolyfills.push(polyfill)
  }
}

if (missingPolyfills.length > 0) {
  console.warn("⚠️ Some related polyfills are missing:", missingPolyfills.join(", "))
  console.warn(`Please run: pnpm add ${missingPolyfills.join(" ")}`)
} else {
  console.log("✅ All required polyfills are installed")
}

console.log("Verification complete!")
