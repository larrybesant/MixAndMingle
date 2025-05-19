import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Initialize Firebase with error handling
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-app.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-app.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
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
