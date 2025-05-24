import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getStorage, connectStorageEmulator } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase app (prevent multiple initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Initialize Firebase services with error handling
let auth, db, storage

try {
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)

  // Connect to emulators in development (optional)
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" && typeof window !== "undefined") {
    try {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
      connectFirestoreEmulator(db, "localhost", 8080)
      connectStorageEmulator(storage, "localhost", 9199)
    } catch (error) {
      // Emulators already connected or not available
      console.log("Firebase emulators not connected:", error)
    }
  }
} catch (error) {
  console.error("Firebase initialization error:", error)
  throw new Error("Failed to initialize Firebase services")
}

export { auth, db, storage }
export default app
