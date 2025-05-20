import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"
import { getStorage } from "firebase-admin/storage"
import { getMessaging } from "firebase-admin/messaging"

// Function to properly format the private key
function formatPrivateKey(key: string | undefined): string {
  if (!key) {
    throw new Error("FIREBASE_PRIVATE_KEY is not defined")
  }

  // If the key already contains newlines, it's already properly formatted
  if (key.includes("-----BEGIN PRIVATE KEY-----") && key.includes("\n")) {
    return key
  }

  // Handle the case where the key is provided as a string with escaped newlines
  if (key.includes("\\n")) {
    return key.replace(/\\n/g, "\n")
  }

  // Handle the case where the key is provided without proper PEM formatting
  if (!key.includes("-----BEGIN PRIVATE KEY-----")) {
    return `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----\n`
  }

  return key
}

// Initialize Firebase Admin SDK function
export function initAdmin() {
  if (getApps().length === 0) {
    try {
      const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY)

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      })

      console.log("Firebase Admin SDK initialized successfully")
    } catch (error) {
      console.error("Error initializing Firebase Admin SDK:", error)
      throw error
    }
  }

  return {
    db: getFirestore(),
    auth: getAuth(),
    storage: getStorage(),
    messaging: getMessaging(),
  }
}

// Auto-initialize for direct exports
let isInitialized = false

try {
  if (getApps().length === 0) {
    const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY)

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })

    isInitialized = true
    console.log("Firebase Admin SDK auto-initialized successfully")
  }
} catch (error) {
  console.error("Error during Firebase Admin SDK auto-initialization:", error)
  // Don't throw here to prevent app from crashing during build
}

// Direct exports for backward compatibility
export const db = isInitialized ? getFirestore() : null
export const auth = isInitialized ? getAuth() : null
export const storage = isInitialized ? getStorage() : null
export const messaging = isInitialized ? getMessaging() : null

// Helper function to get Firebase Admin instances (new pattern)
export function getAdmin() {
  if (!isInitialized) {
    return initAdmin()
  }

  return {
    db: getFirestore(),
    auth: getAuth(),
    storage: getStorage(),
    messaging: getMessaging(),
  }
}
