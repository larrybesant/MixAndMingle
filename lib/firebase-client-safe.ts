import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, enableIndexedDbPersistence, Timestamp, FieldValue } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getDatabase, goOnline, goOffline } from "firebase/database"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
}

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

// Initialize Firebase services
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)
const database = getDatabase(app)

// Use emulators in development if enabled
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" && typeof window !== "undefined") {
  // Import and configure emulators when needed
  import("firebase/auth").then(({ connectAuthEmulator }) => {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
  })

  import("firebase/firestore").then(({ connectFirestoreEmulator }) => {
    connectFirestoreEmulator(db, "localhost", 8080)
  })

  import("firebase/storage").then(({ connectStorageEmulator }) => {
    connectStorageEmulator(storage, "localhost", 9199)
  })

  import("firebase/database").then(({ connectDatabaseEmulator }) => {
    connectDatabaseEmulator(database, "localhost", 9000)
  })
}

// Enable offline persistence for Firestore
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.")
    } else if (err.code === "unimplemented") {
      console.warn("The current browser does not support all of the features required to enable persistence.")
    }
  })
}

// Initialize Firebase Messaging lazily to avoid SSR issues
const initializeMessaging = async () => {
  if (typeof window !== "undefined") {
    try {
      const { getMessaging } = await import("firebase/messaging")
      return getMessaging(app)
    } catch (error) {
      console.error("Error initializing messaging:", error)
      return null
    }
  }
  return null
}

// Export the initialized services
export { app, auth, db, storage, database, goOnline, goOffline, Timestamp, FieldValue, initializeMessaging }

// Export Firestore types
export { Timestamp as FirestoreTimestamp, FieldValue as FirestoreFieldValue } from "firebase/firestore"
