import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"
import { getStorage } from "firebase-admin/storage"
import { getMessaging } from "firebase-admin/messaging"

// Re-export the original functions from Firebase Admin SDK
export { getFirestore } from "firebase-admin/firestore"
export { getAuth } from "firebase-admin/auth"
export { getStorage } from "firebase-admin/storage"
export { getMessaging } from "firebase-admin/messaging"

// Mock services for when Firebase isn't available
const mockDb = {
  collection: () => ({
    doc: () => ({
      get: async () => ({
        exists: false,
        data: () => ({}),
      }),
      set: async () => {},
      update: async () => {},
    }),
    where: () => ({
      get: async () => ({
        forEach: () => {},
        empty: true,
      }),
    }),
  }),
}

const mockAuth = {
  verifyIdToken: async () => ({ uid: "mock-uid" }),
  getUser: async () => ({ uid: "mock-uid", email: "mock@example.com" }),
}

const mockStorage = {
  bucket: () => ({
    file: () => ({
      save: async () => {},
      getSignedUrl: async () => ["https://example.com/mock-url"],
    }),
  }),
}

const mockMessaging = {
  send: async () => "mock-message-id",
  sendMulticast: async () => ({ successCount: 1, failureCount: 0 }),
}

// Check if we're in a build environment
const isBuildEnvironment = process.env.NODE_ENV === "production" && !process.env.VERCEL_URL

// Initialize Firebase Admin or use mocks
let isInitialized = false
const firestoreInstance = null
const authInstance = null
const storageInstance = null
const messagingInstance = null

try {
  // Only try to initialize if we're not in a build environment
  if (!isBuildEnvironment && getApps().length === 0) {
    // Get the private key - try multiple approaches
    let privateKey = process.env.FIREBASE_PRIVATE_KEY

    // Try base64 decode if available
    if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
      try {
        privateKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, "base64").toString("utf8")
        console.log("Successfully decoded private key from base64")
      } catch (e) {
        console.error("Failed to decode base64 private key:", e)
      }
    }

    // Initialize the app
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })

    console.log("Firebase Admin SDK initialized successfully")
    isInitialized = true
  }
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error)
  // Don't throw here to prevent app from crashing during build
}

// Export safe versions of the services
export const db = isInitialized ? getFirestore() : mockDb
export const auth = isInitialized ? getAuth() : mockAuth
export const storage = isInitialized ? getStorage() : mockStorage
export const messaging = isInitialized ? getMessaging() : mockMessaging

// Helper function to get Firebase Admin instances (safe version)
export function getAdmin() {
  return {
    db: isInitialized ? getFirestore() : mockDb,
    auth: isInitialized ? getAuth() : mockAuth,
    storage: isInitialized ? getStorage() : mockStorage,
    messaging: isInitialized ? getMessaging() : mockMessaging,
  }
}
