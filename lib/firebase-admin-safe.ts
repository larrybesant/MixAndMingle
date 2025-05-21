import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"
import { getMessaging } from "firebase-admin/messaging"

// Check if we already have a Firebase admin app initialized
const apps = getApps()

// Function to get private key from environment variable
function getPrivateKey() {
  // If the key is stored as a base64 string
  if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
    return Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, "base64").toString("utf8")
  }

  // If the key is stored directly (with escaped newlines)
  if (process.env.FIREBASE_PRIVATE_KEY) {
    return process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  }

  throw new Error("No Firebase private key found in environment variables")
}

// Initialize the app if it doesn't already exist
const app =
  apps.length > 0
    ? apps[0]
    : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: getPrivateKey(),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      })

// Initialize services
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)
const messaging = getMessaging(app)

// Export the initialized services and types
export { app, auth, db, storage, messaging, Timestamp, FieldValue }
