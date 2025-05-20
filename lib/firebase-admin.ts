import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getFirestore as _getFirestore, type Firestore } from "firebase-admin/firestore"
import { getAuth as _getAuth, type Auth } from "firebase-admin/auth"
import { getStorage as _getStorage, type Storage } from "firebase-admin/storage"
import { getMessaging as _getMessaging, type Messaging } from "firebase-admin/messaging"
import { env } from "./env"

// Re-export the original functions from Firebase Admin SDK
export { _getFirestore as getFirestore } from "firebase-admin/firestore"
export { _getAuth as getAuth } from "firebase-admin/auth"
export { _getStorage as getStorage } from "firebase-admin/storage"
export { _getMessaging as getMessaging } from "firebase-admin/messaging"

// Interface for admin services
interface AdminServices {
  db: Firestore
  auth: Auth
  storage: Storage
  messaging: Messaging
  app: App
}

// Mock services for build time or when Firebase isn't available
const mockServices: AdminServices = {
  db: {} as Firestore,
  auth: {} as Auth,
  storage: {} as Storage,
  messaging: {} as Messaging,
  app: {} as App,
}

// Global variable to track initialization status
let isInitialized = false
let adminServices: AdminServices | null = null

/**
 * Initialize Firebase Admin SDK
 * This function handles initialization with proper error handling
 */
export function initAdmin(): AdminServices {
  // If already initialized, return the existing services
  if (isInitialized && adminServices) {
    return adminServices
  }

  // If we're in a build environment (no actual Firebase needed)
  if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "preview") {
    console.log("Build environment detected, using mock Firebase Admin")
    return mockServices
  }

  try {
    // Check if we have the necessary environment variables
    if (!env.firebase.projectId || !env.firebase.clientEmail) {
      console.error("Missing required Firebase Admin environment variables")
      throw new Error("Missing required Firebase Admin environment variables")
    }

    // Only initialize if not already initialized
    if (getApps().length === 0) {
      // Get the private key from our environment handler
      const privateKey = env.firebase.privateKey

      // Initialize the app
      const app = initializeApp({
        credential: cert({
          projectId: env.firebase.projectId,
          clientEmail: env.firebase.clientEmail,
          privateKey,
        }),
        storageBucket: env.firebase.storageBucket,
      })

      // Create and store the services
      adminServices = {
        db: _getFirestore(app),
        auth: _getAuth(app),
        storage: _getStorage(app),
        messaging: _getMessaging(app),
        app,
      }

      isInitialized = true
      console.log("Firebase Admin SDK initialized successfully")
    } else {
      // If already initialized, get the existing app
      const app = getApps()[0]

      // Create services from the existing app
      adminServices = {
        db: _getFirestore(app),
        auth: _getAuth(app),
        storage: _getStorage(app),
        messaging: _getMessaging(app),
        app,
      }

      isInitialized = true
    }

    return adminServices
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error)

    // In development, we can use mock services to prevent crashes
    if (env.isDevelopment) {
      console.warn("Using mock Firebase Admin services in development")
      return mockServices
    }

    // In production, we should throw the error
    throw error
  }
}

// Try to initialize Firebase Admin
try {
  adminServices = initAdmin()
} catch (error) {
  console.error("Failed to initialize Firebase Admin on startup:", error)
  // Don't throw here to prevent app from crashing during build
}

// Export individual services
export const db = adminServices?.db
export const auth = adminServices?.auth
export const storage = adminServices?.storage
export const messaging = adminServices?.messaging

// Helper function to get Firebase Admin instances (safe version)
export function getAdmin(): AdminServices {
  // If not initialized or initialization failed, try again
  if (!isInitialized || !adminServices) {
    return initAdmin()
  }

  return adminServices
}
