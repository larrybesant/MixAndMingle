const fs = require("fs")
const path = require("path")

console.log("Checking for Node.js polyfill issues...")

// Check if package.json exists
const packageJsonPath = path.join(process.cwd(), "package.json")
if (!fs.existsSync(packageJsonPath)) {
  console.error("Error: package.json not found!")
  process.exit(1)
}

// Read package.json
const packageJson = require(packageJsonPath)

// List of required polyfills
const requiredPolyfills = [
  "crypto-browserify",
  "stream-browserify",
  "buffer",
  "path-browserify",
  "stream-http",
  "https-browserify",
  "os-browserify",
  "process",
  "assert",
  "url",
  "browserify-zlib",
  "querystring-es3",
  "util",
  "events",
]

// Check if all required polyfills are in dependencies
const missingPolyfills = []
for (const polyfill of requiredPolyfills) {
  if (!packageJson.dependencies || !packageJson.dependencies[polyfill]) {
    missingPolyfills.push(polyfill)
  }
}

if (missingPolyfills.length > 0) {
  console.error("Missing polyfill dependencies:")
  missingPolyfills.forEach((polyfill) => console.error(`- ${polyfill}`))
  console.error("\nPlease add these dependencies to your package.json and run npm install.")
  process.exit(1)
}

// Check next.config.js
const nextConfigPath = path.join(process.cwd(), "next.config.js")
if (!fs.existsSync(nextConfigPath)) {
  console.error("Error: next.config.js not found!")
  process.exit(1)
}

const nextConfigContent = fs.readFileSync(nextConfigPath, "utf8")

// Check if webpack config includes polyfill fallbacks
if (!nextConfigContent.includes('crypto: require.resolve("crypto-browserify")')) {
  console.error("Error: next.config.js does not include proper crypto-browserify polyfill configuration!")
  process.exit(1)
}

console.log("All Node.js polyfills are properly configured!")
