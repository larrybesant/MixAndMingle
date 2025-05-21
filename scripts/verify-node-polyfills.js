/**
 * This script verifies that all required Node.js polyfills are correctly configured
 */

const fs = require("fs")
const path = require("path")
const chalk = require("chalk") // You may need to install this: pnpm add chalk

console.log(chalk.blue("Checking Node.js polyfill configuration..."))

// Define all the polyfills we want to check
const requiredPolyfills = [
  { name: "crypto-browserify", importPath: "crypto" },
  { name: "stream-browserify", importPath: "stream" },
  { name: "buffer", importPath: "buffer" },
  { name: "path-browserify", importPath: "path" },
  { name: "stream-http", importPath: "http" },
  { name: "https-browserify", importPath: "https" },
  { name: "os-browserify", importPath: "os" },
  { name: "process", importPath: "process" },
  { name: "assert", importPath: "assert" },
  { name: "url", importPath: "url" },
  { name: "browserify-zlib", importPath: "zlib" },
  { name: "querystring-es3", importPath: "querystring" },
  { name: "util", importPath: "util" },
  { name: "events", importPath: "events" },
  { name: "constants-browserify", importPath: "constants" },
  { name: "timers-browserify", importPath: "timers" },
  { name: "domain-browser", importPath: "domain" },
  { name: "string_decoder", importPath: "string_decoder" },
  { name: "punycode", importPath: "punycode" },
]

// Check package.json for dependencies
const packageJsonPath = path.join(process.cwd(), "package.json")
if (!fs.existsSync(packageJsonPath)) {
  console.error(chalk.red("Error: package.json not found!"))
  process.exit(1)
}

const packageJson = require(packageJsonPath)
const dependencies = packageJson.dependencies || {}

// Check for missing dependencies
const missingDependencies = requiredPolyfills.filter((polyfill) => !dependencies[polyfill.name])

if (missingDependencies.length > 0) {
  console.error(chalk.red("Missing polyfill dependencies:"))
  missingDependencies.forEach((dep) => {
    console.error(chalk.red(`- ${dep.name} (for ${dep.importPath})`))
  })

  // Generate installation command
  const installCommand = `pnpm add ${missingDependencies.map((d) => d.name).join(" ")}`
  console.log(chalk.yellow("\nRun the following command to install missing dependencies:"))
  console.log(chalk.cyan(installCommand))

  process.exit(1)
}

// Check next.config.js for webpack configuration
const nextConfigPath = path.join(process.cwd(), "next.config.js")
if (!fs.existsSync(nextConfigPath)) {
  console.error(chalk.red("Error: next.config.js not found!"))
  process.exit(1)
}

const nextConfigContent = fs.readFileSync(nextConfigPath, "utf8")

// Check for webpack configuration
if (!nextConfigContent.includes("webpack: (config, { isServer })")) {
  console.error(chalk.red("Error: webpack configuration not found in next.config.js!"))
  process.exit(1)
}

// Check for fallbacks configuration
if (!nextConfigContent.includes("config.resolve.fallback")) {
  console.error(chalk.red("Error: fallbacks configuration not found in next.config.js!"))
  process.exit(1)
}

// Check for specific polyfills in webpack config
const missingWebpackPolyfills = []
for (const polyfill of requiredPolyfills) {
  const pattern = new RegExp(`${polyfill.importPath}:\\s*require\\.resolve\$$['"']${polyfill.name}['"']\$$`)
  if (!pattern.test(nextConfigContent) && polyfill.importPath !== "fs") {
    missingWebpackPolyfills.push(polyfill)
  }
}

if (missingWebpackPolyfills.length > 0) {
  console.error(chalk.red("Missing polyfill configurations in webpack:"))
  missingWebpackPolyfills.forEach((polyfill) => {
    console.error(chalk.red(`- ${polyfill.importPath}: require.resolve("${polyfill.name}")`))
  })
  process.exit(1)
}

// Check for ProvidePlugin configuration
if (!nextConfigContent.includes("ProvidePlugin")) {
  console.error(chalk.red("Error: ProvidePlugin configuration not found in next.config.js!"))
  process.exit(1)
}

if (!nextConfigContent.includes('process: "process/browser"')) {
  console.error(chalk.red("Error: process polyfill not provided in ProvidePlugin!"))
  process.exit(1)
}

if (!nextConfigContent.includes('Buffer: ["buffer", "Buffer"]')) {
  console.error(chalk.red("Error: Buffer polyfill not provided in ProvidePlugin!"))
  process.exit(1)
}

console.log(chalk.green("✓ All Node.js polyfills are correctly configured!"))
console.log(chalk.blue("✓ Package dependencies: ") + chalk.green("OK"))
console.log(chalk.blue("✓ Webpack fallbacks: ") + chalk.green("OK"))
console.log(chalk.blue("✓ ProvidePlugin: ") + chalk.green("OK"))

// Create a test file to verify imports
const testDir = path.join(process.cwd(), "tests", "polyfills")
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true })
}

const testFilePath = path.join(testDir, "verify-imports.js")
const testFileContent = `
/**
 * This file tests importing Node.js built-in modules
 * It should work in both Node.js and browser environments
 */

// Test importing all polyfilled modules
${requiredPolyfills
  .filter((p) => p.importPath !== "fs") // Skip fs as it's usually set to false
  .map((p) => `import * as ${p.importPath.replace(/-/g, "_")} from '${p.importPath}';`)
  .join("\n")}

// Log success
console.log('All modules imported successfully!');

// Test some basic functionality
export function runTests() {
  // Test crypto
  const cryptoTest = crypto.createHash ? 'Available' : 'Not available';
  console.log('Crypto:', cryptoTest);
  
  // Test buffer
  const bufferTest = typeof Buffer !== 'undefined' ? 'Available' : 'Not available';
  console.log('Buffer:', bufferTest);
  
  // Test path
  const pathTest = path.join ? 'Available' : 'Not available';
  console.log('Path:', pathTest);
  
  return {
    crypto: cryptoTest,
    buffer: bufferTest,
    path: pathTest
  };
}
`

fs.writeFileSync(testFilePath, testFileContent)
console.log(chalk.blue("\nCreated test file at: ") + chalk.cyan(testFilePath))
console.log(chalk.yellow("You can import this file in your application to verify that imports work correctly."))

console.log(chalk.green("\nAll checks passed! Your Node.js polyfills are correctly configured."))
