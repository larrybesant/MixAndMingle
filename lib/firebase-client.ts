import { initializeApp, getApps, type FirebaseOptions } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getStorage, connectStorageEmulator } from "firebase/storage"
import { getMessaging, isSupported } from "firebase/messaging"

// Firebase configuration with validation
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Validate required config
const validateConfig = () => {
  const required = ["apiKey", "authDomain", "projectId", "appId"]
  const missing = required.filter((key) => !firebaseConfig[key as keyof FirebaseOptions])

  if (missing.length > 0) {
    console.error(`Firebase initialization error: Missing required config: ${missing.join(", ")}`)
    return false
  }
  return true
}

// Initialize Firebase with better error handling
let firebaseApp
let auth
let db
let storage
let messagingInstance = null

try {
  if (!validateConfig()) {
    throw new Error("Invalid Firebase configuration")
  }

  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig)
    console.log("Firebase initialized successfully")
  } else {
    firebaseApp = getApps()[0]
  }

  // Initialize services
  auth = getAuth(firebaseApp)
  db = getFirestore(firebaseApp)
  storage = getStorage(firebaseApp)

  // Connect to emulators in development
  if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true") {
    console.log("🔥 Using Firebase Emulators")
    connectAuthEmulator(auth, "http://localhost:9099")
    connectFirestoreEmulator(db, "localhost", 8080)
    connectStorageEmulator(storage, "localhost", 9199)
  }
} catch (error) {
  console.error("Firebase initialization error:", error)

  // Fallback initialization for client-side
  if (typeof window !== "undefined") {
    // Create minimal fallback objects to prevent app crashes
    auth = auth || {
      signInWithEmailAndPassword: () => Promise.reject(new Error("Auth not initialized")),
      createUserWithEmailAndPassword: () => Promise.reject(new Error("Auth not initialized")),
      onAuthStateChanged: (callback) => {
        callback(null)
        return () => {}
      },
    }
    db = db || { collection: () => ({ doc: () => ({ get: () => Promise.resolve({ exists: false }) }) }) }
    storage = storage || { ref: () => ({ put: () => Promise.reject(new Error("Storage not initialized")) }) }
  }
}

// Initialize Firebase Cloud Messaging safely
const initializeMessaging = async () => {
  if (!firebaseApp) return null

  try {
    if (await isSupported()) {
      messagingInstance = getMessaging(firebaseApp)
      return messagingInstance
    }
    return null
  } catch (error) {
    console.error("Error initializing Firebase messaging:", error)
    return null
  }
}

// Safe getter for messaging
const getMessagingInstance = () => messagingInstance

// Export initialized services
export { auth, db, storage, initializeMessaging, getMessagingInstance }
export default firebaseApp
