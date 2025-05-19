import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Initialize Firebase with hardcoded configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKMDdDQ1OcJNoznSAMfMtVh9wwtyyFaHc",
  authDomain: "mixandmingle-1c898.firebaseapp.com",
  projectId: "mixandmingle-1c898",
  storageBucket: "mixandmingle-1c898.firebasestorage.app",
  messagingSenderId: "1099369771281",
  appId: "1:1099369771281:web:de15fff5a55a2eedb65cb0",
  measurementId: "G-ZKQ6D7EXYY",
}

// Check if we're in development mode and use mock Firebase if needed
const isDevelopment = process.env.NODE_ENV === "development"

// Initialize Firebase with error handling
let app
let auth
let db
let storage

try {
  // Initialize Firebase
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
} catch (error) {
  console.error("Firebase initialization error:", error)

  // In development, we can continue with mock objects
  if (isDevelopment) {
    console.warn("Using mock Firebase services for development")
    // These are just placeholders to prevent the app from crashing
    auth = {} as any
    db = {} as any
    storage = {} as any
  } else {
    // In production, we should still throw the error
    throw error
  }
}

export { app, auth, db, storage }
