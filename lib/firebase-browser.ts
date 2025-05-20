// IMPORTANT: This file should ONLY contain browser-compatible code
// NO Node.js modules or server-side code should be imported here

import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import {
  disableNetwork,
  enableNetwork,
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Add this for Analytics
}

// Initialize Firebase only if it hasn't been initialized already
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase Auth
export const auth = getAuth(firebaseApp)

// Initialize Firestore with offline persistence settings
export const db = initializeFirestore(firebaseApp, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  }),
})

// Initialize Firebase Storage
export const storage = getStorage(firebaseApp)

// Initialize Firebase Analytics (only in browser)
export const initializeAnalytics = async () => {
  if (typeof window !== "undefined") {
    try {
      const { getAnalytics } = await import("firebase/analytics")
      return getAnalytics(firebaseApp)
    } catch (error) {
      console.error("Error initializing Firebase analytics:", error)
      return null
    }
  }
  return null
}

// Safe messaging initialization that only runs in browser
export const initializeMessaging = async () => {
  if (typeof window !== "undefined") {
    try {
      const { getMessaging } = await import("firebase/messaging")
      return getMessaging(firebaseApp)
    } catch (error) {
      console.error("Error initializing Firebase messaging:", error)
      return null
    }
  }
  return null
}

// Network status control functions
export const goOffline = () => disableNetwork(db)
export const goOnline = () => enableNetwork(db)

export default firebaseApp
