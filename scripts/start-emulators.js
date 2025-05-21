const { spawn } = require("child_process")
const fs = require("fs")
const path = require("path")

// Check if firebase.json exists
const firebaseConfigPath = path.join(__dirname, "..", "firebase.json")
if (!fs.existsSync(firebaseConfigPath)) {
  console.error("Error: firebase.json not found. Please make sure it exists in the project root.")
  process.exit(1)
}

console.log("Starting Firebase emulators...")

// Start the Firebase emulators
const emulators = spawn("npx", ["firebase", "emulators:start"], {
  stdio: "inherit",
  shell: true,
})

// Handle process exit
process.on("SIGINT", () => {
  console.log("Stopping Firebase emulators...")
  emulators.kill("SIGINT")
  process.exit(0)
})

emulators.on("close", (code) => {
  console.log(`Firebase emulators exited with code ${code}`)
  process.exit(code)
})
