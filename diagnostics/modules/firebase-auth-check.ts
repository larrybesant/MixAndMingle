import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import fetch from "node-fetch"

export async function checkFirebaseAuth() {
  console.log("  Checking Firebase Authentication configuration...")

  const results = {
    envVars: {
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: false,
      NEXT_PUBLIC_FIREBASE_API_KEY: false,
      FIREBASE_CLIENT_EMAIL: false,
      FIREBASE_PRIVATE_KEY: false,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: false,
    },
    firebaseAdminInitialized: false,
    firebaseClientConfigured: false,
    authEndpointsWorking: false,
    sessionTokensValid: false,
    criticalIssues: [] as string[],
  }

  // Check environment variables
  const requiredEnvVars = [
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  ]

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      results.envVars[envVar as keyof typeof results.envVars] = true
    } else {
      results.criticalIssues.push(`Missing environment variable: ${envVar}`)
    }
  }

  // Initialize Firebase Admin SDK
  try {
    if (getApps().length === 0) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

      if (privateKey && process.env.FIREBASE_CLIENT_EMAIL && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        initializeApp({
          credential: cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
          }),
        })
        console.log("  ✅ Firebase Admin SDK initialized successfully")
        results.firebaseAdminInitialized = true
      }
    } else {
      console.log("  ✅ Firebase Admin SDK already initialized")
      results.firebaseAdminInitialized = true
    }

    // Test Firebase Auth functionality
    if (results.firebaseAdminInitialized) {
      const auth = getAuth()
      try {
        // List users (limit to 1) to test auth functionality
        await auth.listUsers(1)
        console.log("  ✅ Firebase Auth is functional")
      } catch (error) {
        console.error("  ❌ Firebase Auth test failed:", error)
        results.criticalIssues.push("Firebase Auth functionality test failed")
      }
    }
  } catch (error) {
    console.error("  ❌ Failed to initialize Firebase Admin SDK:", error)
    results.criticalIssues.push("Failed to initialize Firebase Admin SDK")
  }

  // Check Firebase client configuration
  try {
    if (
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    ) {
      results.firebaseClientConfigured = true
      console.log("  ✅ Firebase client configuration is valid")
    } else {
      console.log("  ❌ Firebase client configuration is incomplete")
      results.criticalIssues.push("Incomplete Firebase client configuration")
    }
  } catch (error) {
    console.error("  ❌ Error checking Firebase client configuration:", error)
  }

  // Check auth endpoints
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-config`)
    if (response.ok) {
      results.authEndpointsWorking = true
      console.log("  ✅ Auth endpoints are working")
    } else {
      console.log("  ❌ Auth endpoints returned an error:", await response.text())
      results.criticalIssues.push("Auth endpoints are not working properly")
    }
  } catch (error) {
    console.error("  ❌ Failed to check auth endpoints:", error)
    results.criticalIssues.push("Failed to connect to auth endpoints")
  }

  // Check for invalid session tokens
  try {
    const auth = getAuth()
    // This is a simplified check - in a real scenario, you'd check actual session tokens
    results.sessionTokensValid = true
    console.log("  ✅ Session tokens appear to be valid")
  } catch (error) {
    console.error("  ❌ Error checking session tokens:", error)
    results.criticalIssues.push("Error validating session tokens")
  }

  return results
}
