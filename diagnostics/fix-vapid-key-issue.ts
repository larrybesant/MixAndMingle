import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"

function fixVapidKeyIssue() {
  console.log("🔧 Fixing Firebase VAPID key issue...")

  try {
    // Create the VAPID key API route
    const apiDir = "./app/api/firebase/vapid-key"

    // Create directories if they don't exist
    if (!existsSync("./app/api/firebase")) {
      mkdirSync("./app/api/firebase", { recursive: true })
    }

    if (!existsSync(apiDir)) {
      mkdirSync(apiDir, { recursive: true })
    }

    // Create the VAPID key API route
    const vapidKeyRouteContent = `import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Only return the public VAPID key
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY

    if (!vapidKey) {
      return NextResponse.json({ error: "VAPID key not configured" }, { status: 500 })
    }

    return NextResponse.json({ vapidKey })
  } catch (error) {
    console.error("Error fetching VAPID key:", error)
    return NextResponse.json({ error: "Failed to fetch VAPID key" }, { status: 500 })
  }
}
`

    writeFileSync(`${apiDir}/route.ts`, vapidKeyRouteContent)
    console.log("✅ Created VAPID key API route")

    // Update the firebase-client.ts file
    if (existsSync("./lib/firebase/firebase-client.ts")) {
      let clientContent = readFileSync("./lib/firebase/firebase-client.ts", "utf8")

      // Check if the file already has the fetchVapidKey function
      if (!clientContent.includes("fetchVapidKey")) {
        // Add the fetchVapidKey function
        clientContent = clientContent.replace(
          /export async function requestNotificationPermission$$$$ {/,
          `// Fetch VAPID key from server
async function fetchVapidKey() {
  try {
    const response = await fetch("/api/firebase/vapid-key")
    if (!response.ok) {
      throw new Error("Failed to fetch VAPID key")
    }
    const data = await response.json()
    return data.vapidKey
  } catch (error) {
    console.error("Error fetching VAPID key:", error)
    return null
  }
}

export async function requestNotificationPermission() {`,
        )

        // Update the getToken call to use the fetched VAPID key
        clientContent = clientContent.replace(
          /const token = await getToken$$messaging, {[\s\S]*?}$$;/,
          `// Fetch VAPID key from server
    const vapidKey = await fetchVapidKey();

    if (!vapidKey) {
      console.error("Failed to get VAPID key from server")
      return null
    }

    // Get token
    const token = await getToken(messaging, {
      vapidKey: vapidKey,
    });`,
        )

        writeFileSync("./lib/firebase/firebase-client.ts", clientContent)
        console.log("✅ Updated firebase-client.ts to fetch VAPID key from API")
      } else {
        console.log("✓ firebase-client.ts already has fetchVapidKey function")
      }
    } else {
      console.log("❌ Could not find lib/firebase/firebase-client.ts")
      return false
    }

    return true
  } catch (error) {
    console.error("❌ Error fixing VAPID key issue:", error)
    return false
  }
}

// Run the fix
const success = fixVapidKeyIssue()
console.log(success ? "✅ Fix completed successfully" : "❌ Fix failed")
