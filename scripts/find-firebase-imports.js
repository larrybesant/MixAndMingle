const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// Directories to search
const directories = ["app", "components", "lib", "hooks", "contexts", "utils"]

// Firebase import patterns to look for
const patterns = [
  'from "firebase/',
  "from 'firebase/",
  'from "firebase-admin/',
  "from 'firebase-admin/",
  "import firebase",
  'require("firebase',
  "require('firebase",
  'require("firebase-admin',
  "require('firebase-admin",
]

// Function to search for patterns in a file
function searchFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    const matches = []

    patterns.forEach((pattern) => {
      const regex = new RegExp(pattern, "g")
      let match
      while ((match = regex.exec(content)) !== null) {
        const line = content.substring(0, match.index).split("\n").length
        matches.push({
          pattern,
          line,
          context: content.split("\n")[line - 1].trim(),
        })
      }
    })

    if (matches.length > 0) {
      console.log(`\nFile: ${filePath}`)
      matches.forEach((match) => {
        console.log(`  Line ${match.line}: ${match.context}`)
      })
    }

    return matches.length > 0
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message)
    return false
  }
}

// Function to recursively search directories
function searchDirectory(dir) {
  let foundMatches = false

  try {
    const files = fs.readdirSync(dir)

    for (const file of files) {
      const filePath = path.join(dir, file)
      const stats = fs.statSync(filePath)

      if (stats.isDirectory()) {
        // Skip node_modules and .next directories
        if (file !== "node_modules" && file !== ".next") {
          const foundInSubdir = searchDirectory(filePath)
          foundMatches = foundMatches || foundInSubdir
        }
      } else if (
        stats.isFile() &&
        (filePath.endsWith(".js") || filePath.endsWith(".jsx") || filePath.endsWith(".ts") || filePath.endsWith(".tsx"))
      ) {
        const foundInFile = searchFile(filePath)
        foundMatches = foundMatches || foundInFile
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message)
  }

  return foundMatches
}

// Main function
function main() {
  console.log("Searching for Firebase imports...")

  let foundAny = false
  for (const dir of directories) {
    if (fs.existsSync(dir)) {
      const found = searchDirectory(dir)
      foundAny = foundAny || found
    }
  }

  if (!foundAny) {
    console.log("No direct Firebase imports found! All components should be using the safe imports.")
  } else {
    console.log("\nFound Firebase imports that need to be updated to use the safe versions:")
    console.log('- Replace "firebase/xxx" imports with imports from "@/lib/firebase-client-safe"')
    console.log('- Replace "firebase-admin/xxx" imports with imports from "@/lib/firebase-admin-safe"')
  }
}

main()
