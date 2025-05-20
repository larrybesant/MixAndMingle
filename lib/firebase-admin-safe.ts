// This file should only be imported in server components or API routes
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"
import { getStorage } from "firebase-admin/storage"
import { getMessaging } from "firebase-admin/messaging"

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

// Skip initialization during build or on client
if (typeof window !== "undefined") {
  console.log("Client environment detected, using mock Firebase services")
  firestoreInstance = mockDb
  authInstance = mockAuth
  storageInstance = mockStorage
  messagingInstance = mockMessaging
} else {
  try {
    if (getApps().length === 0) {
      // Initialize the app with environment variables
      const privateKey = process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        : undefined

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
      firestoreInstance = getFirestore()
      authInstance = getAuth()
      storageInstance = getStorage()
      messagingInstance = getMessaging()
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

// Re-export Firestore types
export { Timestamp, FieldValue } from "firebase-admin/firestore"
