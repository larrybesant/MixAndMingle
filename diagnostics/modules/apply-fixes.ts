import { writeFileSync, readFileSync, existsSync } from "fs"
import { execSync } from "child_process"
import { getAuth } from "firebase-admin/auth"

export async function applyFixes(results: Record<string, any>, criticalIssues: string[]) {
  console.log("  Applying fixes to identified issues...")

  const fixes = {
    fixesApplied: false,
    fixesList: [] as string[],
    errors: [] as string[],
  }

  // Fix Firebase Auth context import issue
  if (criticalIssues.some((issue) => issue.includes("auth-context"))) {
    try {
      console.log("  Fixing auth-context import issue...")

      // Check if layout.tsx exists
      if (existsSync("./app/layout.tsx")) {
        let layoutContent = readFileSync("./app/layout.tsx", "utf8")

        // Fix the import statement
        layoutContent = layoutContent.replace(
          /import\s+{\s*AuthProvider\s*}\s+from\s+['"]@\/lib\/auth\/auth-context['"]/,
          "import { AuthProvider } from '@/lib/auth/auth-context.tsx'",
        )

        // Write the fixed content back
        writeFileSync("./app/layout.tsx", layoutContent)

        fixes.fixesApplied = true
        fixes.fixesList.push("Fixed auth-context import in app/layout.tsx")
        console.log("  ✅ Fixed auth-context import in app/layout.tsx")
      } else {
        console.log("  ❌ Could not find app/layout.tsx")
        fixes.errors.push("Could not find app/layout.tsx to fix auth-context import")
      }
    } catch (error) {
      console.error("  ❌ Error fixing auth-context import:", error)
      fixes.errors.push(`Failed to fix auth-context import: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Fix Firebase VAPID key issue
  if (criticalIssues.some((issue) => issue.includes("VAPID"))) {
    try {
      console.log("  Fixing Firebase VAPID key issue...")

      // Check if the VAPID key API route exists
      if (!existsSync("./app/api/firebase/vapid-key/route.ts")) {
        // Create the directory if it doesn't exist
        if (!existsSync("./app/api/firebase")) {
          execSync("mkdir -p ./app/api/firebase/vapid-key")
        } else if (!existsSync("./app/api/firebase/vapid-key")) {
          execSync("mkdir -p ./app/api/firebase/vapid-key")
        }

        // Create the VAPID key API route
        const vapidKeyRouteContent = `
import { NextResponse } from "next/server"

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

        writeFileSync("./app/api/firebase/vapid-key/route.ts", vapidKeyRouteContent)

        fixes.fixesApplied = true
        fixes.fixesList.push("Created VAPID key API route")
        console.log("  ✅ Created VAPID key API route")
      }

      // Update the firebase-client.ts file to use the API route
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

          fixes.fixesApplied = true
          fixes.fixesList.push("Updated firebase-client.ts to fetch VAPID key from API")
          console.log("  ✅ Updated firebase-client.ts to fetch VAPID key from API")
        } else {
          console.log("  ✓ firebase-client.ts already has fetchVapidKey function")
        }
      } else {
        console.log("  ❌ Could not find lib/firebase/firebase-client.ts")
        fixes.errors.push("Could not find lib/firebase/firebase-client.ts to fix VAPID key issue")
      }
    } catch (error) {
      console.error("  ❌ Error fixing VAPID key issue:", error)
      fixes.errors.push(`Failed to fix VAPID key issue: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Reset invalid session tokens if necessary
  if (criticalIssues.some((issue) => issue.includes("session token"))) {
    try {
      console.log("  Resetting invalid session tokens...")

      const auth = getAuth()

      // List users (limit to 100 for safety)
      const listUsersResult = await auth.listUsers(100)

      let resetCount = 0
      for (const user of listUsersResult.users) {
        // Revoke refresh tokens for all users to force re-authentication
        await auth.revokeRefreshTokens(user.uid)
        resetCount++
      }

      fixes.fixesApplied = true
      fixes.fixesList.push(`Reset session tokens for ${resetCount} users`)
      console.log(`  ✅ Reset session tokens for ${resetCount} users`)
    } catch (error) {
      console.error("  ❌ Error resetting session tokens:", error)
      fixes.errors.push(`Failed to reset session tokens: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return fixes
}
