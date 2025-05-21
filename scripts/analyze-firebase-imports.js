const fs = require("fs")
const path = require("path")
const glob = require("glob")

// Define Firebase packages to check
const firebasePackages = [
  "firebase/app",
  "firebase/auth",
  "firebase/firestore",
  "firebase/storage",
  "firebase/analytics",
  "firebase/messaging",
  "firebase/functions",
  "firebase/database",
  "firebase/performance",
  "firebase/remote-config",
  "firebase-admin",
]

// Find all JS/TS files in the project
const files = glob.sync("**/*.{js,jsx,ts,tsx}", {
  ignore: ["node_modules/**", ".next/**", "out/**", "scripts/**"],
})

// Track imports by file
const importsByFile = {}
let totalImports = 0

// Analyze each file
files.forEach((file) => {
  const content = fs.readFileSync(file, "utf8")
  const firebaseImports = []

  // Check for different import patterns
  firebasePackages.forEach((pkg) => {
    // Check for * imports
    if (
      content.includes(`import * as ${pkg.split("/").pop()} from '${pkg}'`) ||
      content.includes(`import * as ${pkg.split("/").pop()} from "${pkg}"`)
    ) {
      firebaseImports.push(`${pkg} (entire module)`)
      totalImports++
    }

    // Check for default imports
    if (
      content.includes(`import ${pkg.split("/").pop()} from '${pkg}'`) ||
      content.includes(`import ${pkg.split("/").pop()} from "${pkg}"`)
    ) {
      firebaseImports.push(`${pkg} (default import)`)
      totalImports++
    }

    // Check for named imports
    const namedImportRegex = new RegExp(`import\\s*{([^}]*)}\\s*from\\s*['"]${pkg}['"]`, "g")
    const matches = content.matchAll(namedImportRegex)

    for (const match of matches) {
      if (match[1]) {
        const namedImports = match[1]
          .split(",")
          .map((i) => i.trim())
          .filter((i) => i)
        firebaseImports.push(`${pkg} (${namedImports.length} named imports: ${namedImports.join(", ")})`)
        totalImports += namedImports.length
      }
    }
  })

  if (firebaseImports.length > 0) {
    importsByFile[file] = firebaseImports
  }
})

// Generate report
console.log("=== Firebase Import Analysis ===\n")
console.log(`Found Firebase imports in ${Object.keys(importsByFile).length} files (${totalImports} total imports)\n`)

// Files with the most imports
const sortedFiles = Object.entries(importsByFile).sort((a, b) => b[1].length - a[1].length)

console.log("Top files by import count:")
sortedFiles.slice(0, 10).forEach(([file, imports]) => {
  console.log(`\n${file} (${imports.length} imports):`)
  imports.forEach((imp) => console.log(`  - ${imp}`))
})

// Optimization suggestions
console.log("\n=== Optimization Suggestions ===\n")
console.log("1. Replace wildcard imports with specific named imports")
console.log("2. Use dynamic imports for Firebase services not needed at startup")
console.log("3. Consider creating a centralized Firebase service module")
console.log('4. Use tree-shakable imports (e.g., import { getAuth } from "firebase/auth")')
