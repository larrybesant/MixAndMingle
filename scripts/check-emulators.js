const http = require("http")

// Check if Firestore emulator is running
function checkFirestoreEmulator() {
  return new Promise((resolve) => {
    const req = http.request(
      {
        host: "localhost",
        port: 8080,
        path: "/",
        method: "GET",
        timeout: 1000,
      },
      (res) => {
        resolve(res.statusCode === 200 || res.statusCode === 302)
      },
    )

    req.on("error", () => {
      resolve(false)
    })

    req.on("timeout", () => {
      req.destroy()
      resolve(false)
    })

    req.end()
  })
}

// Check if Auth emulator is running
function checkAuthEmulator() {
  return new Promise((resolve) => {
    const req = http.request(
      {
        host: "localhost",
        port: 9099,
        path: "/",
        method: "GET",
        timeout: 1000,
      },
      (res) => {
        resolve(res.statusCode === 200 || res.statusCode === 302)
      },
    )

    req.on("error", () => {
      resolve(false)
    })

    req.on("timeout", () => {
      req.destroy()
      resolve(false)
    })

    req.end()
  })
}

// Check if Storage emulator is running
function checkStorageEmulator() {
  return new Promise((resolve) => {
    const req = http.request(
      {
        host: "localhost",
        port: 9199,
        path: "/",
        method: "GET",
        timeout: 1000,
      },
      (res) => {
        resolve(res.statusCode === 200 || res.statusCode === 302)
      },
    )

    req.on("error", () => {
      resolve(false)
    })

    req.on("timeout", () => {
      req.destroy()
      resolve(false)
    })

    req.end()
  })
}

async function checkAllEmulators() {
  const firestoreRunning = await checkFirestoreEmulator()
  const authRunning = await checkAuthEmulator()
  const storageRunning = await checkStorageEmulator()

  console.log("Firestore Emulator:", firestoreRunning ? "Running" : "Not Running")
  console.log("Auth Emulator:", authRunning ? "Running" : "Not Running")
  console.log("Storage Emulator:", storageRunning ? "Running" : "Not Running")

  if (firestoreRunning && authRunning && storageRunning) {
    console.log("All emulators are running!")
    return true
  } else {
    console.log('Some emulators are not running. Please start them with "npm run emulators".')
    return false
  }
}

checkAllEmulators().then((allRunning) => {
  process.exit(allRunning ? 0 : 1)
})
