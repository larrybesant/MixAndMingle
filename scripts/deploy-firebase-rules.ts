import { execSync } from "child_process"
import * as fs from "fs"
import * as path from "path"

// Function to deploy Firestore rules
function deployFirestoreRules() {
  console.log("Deploying Firestore security rules...")

  try {
    // Create a temporary firebase.json file for Firestore rules deployment
    const firestoreConfig = {
      firestore: {
        rules: "firebase/firestore.rules",
        indexes: "firebase/firestore.indexes.json",
      },
    }

    // Check if indexes file exists, create if not
    const indexesPath = path.join(process.cwd(), "firebase/firestore.indexes.json")
    if (!fs.existsSync(indexesPath)) {
      fs.writeFileSync(indexesPath, JSON.stringify({ indexes: [] }, null, 2))
    }

    // Write temporary firebase.json
    fs.writeFileSync("firebase.json", JSON.stringify(firestoreConfig, null, 2))

    // Deploy rules
    execSync("firebase deploy --only firestore:rules", { stdio: "inherit" })

    console.log("Firestore rules deployed successfully!")
  } catch (error) {
    console.error("Error deploying Firestore rules:", error)
    process.exit(1)
  }
}

// Function to deploy Storage rules
function deployStorageRules() {
  console.log("Deploying Storage security rules...")

  try {
    // Create a temporary firebase.json file for Storage rules deployment
    const storageConfig = {
      storage: {
        rules: "firebase/storage.rules",
      },
    }

    // Write temporary firebase.json
    fs.writeFileSync("firebase.json", JSON.stringify(storageConfig, null, 2))

    // Deploy rules
    execSync("firebase deploy --only storage", { stdio: "inherit" })

    console.log("Storage rules deployed successfully!")
  } catch (error) {
    console.error("Error deploying Storage rules:", error)
    process.exit(1)
  }
}

// Main function
async function main() {
  // Check if firebase CLI is installed
  try {
    execSync("firebase --version", { stdio: "ignore" })
  } catch (error) {
    console.error("Firebase CLI is not installed. Please install it with: npm install -g firebase-tools")
    process.exit(1)
  }

  // Check if user is logged in
  try {
    execSync("firebase projects:list", { stdio: "ignore" })
  } catch (error) {
    console.error("You are not logged in to Firebase. Please run: firebase login")
    process.exit(1)
  }

  // Deploy rules
  deployFirestoreRules()
  deployStorageRules()

  // Clean up
  if (fs.existsSync("firebase.json")) {
    fs.unlinkSync("firebase.json")
  }

  console.log("All security rules deployed successfully!")
}

main().catch(console.error)
