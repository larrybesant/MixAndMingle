import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore as _getFirestore } from "firebase-admin/firestore"
import { getAuth as _getAuth } from "firebase-admin/auth"
import { getStorage as _getStorage } from "firebase-admin/storage"
import { getMessaging as _getMessaging } from "firebase-admin/messaging"
import { getPrivateKey, isBuildEnvironment } from "./private-key-handler"
import { Timestamp, FieldValue } from "firebase-admin/firestore"

// Re-export Firestore types
export { Timestamp, FieldValue }

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

// Initialize Firebase Admin or use mocks
let isInitialized = false
let firestoreInstance = null
let authInstance = null
let storageInstance = null
let messagingInstance = null

// Skip initialization during build
if (isBuildEnvironment()) {
  console.log("Build environment detected, using mock Firebase services")
  firestoreInstance = mockDb
  authInstance = mockAuth
  storageInstance = mockStorage
  messagingInstance = mockMessaging
} else {
  try {
    if (getApps().length === 0) {
      // Get the private key using our dedicated handler
      const privateKey = getPrivateKey()

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
    } else {
      console.log("Firebase Admin SDK already initialized")
      isInitialized = true
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error)
    // Don't throw here to prevent app from crashing
  }

  // Initialize services if Firebase is initialized
  if (isInitialized) {
    try {
      firestoreInstance = _getFirestore()
      authInstance = _getAuth()
      storageInstance = _getStorage()
      messagingInstance = _getMessaging()
    } catch (error) {
      console.error("Error initializing Firebase services:", error)
      // Fall back to mocks if service initialization fails
      firestoreInstance = mockDb
      authInstance = mockAuth
      storageInstance = mockStorage
      messagingInstance = mockMessaging
    }
  } else {
    // Use mocks if Firebase isn't initialized
    firestoreInstance = mockDb
    authInstance = mockAuth
    storageInstance = mockStorage
    messagingInstance = mockMessaging
  }
}

// Export safe versions of the services
export const db = firestoreInstance || mockDb
export const auth = authInstance || mockAuth
export const storage = storageInstance || mockStorage
export const messaging = messagingInstance || mockMessaging

// Helper function to get Firebase Admin instances (safe version)
export function getAdmin() {
  return {
    db: firestoreInstance || mockDb,
    auth: authInstance || mockAuth,
    storage: storageInstance || mockStorage,
    messaging: messagingInstance || mockMessaging,
  }
}
