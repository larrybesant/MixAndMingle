import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getMessaging } from "firebase-admin/messaging"
import { getStorage } from "firebase-admin/storage"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import * as fs from "fs"
import * as path from "path"

// Initialize Firebase Admin SDK if it hasn't been initialized already
export function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    try {
      let credential

      // Check if we're in development mode and have a service account file
      if (process.env.NODE_ENV === "development" && fs.existsSync(path.join(process.cwd(), "service-account.json"))) {
        console.log("Using local service account file for Firebase Admin SDK")
        const serviceAccount = require(path.join(process.cwd(), "service-account.json"))
        credential = cert(serviceAccount)
      } else {
        // Use environment variables in production
        console.log("Using environment variables for Firebase Admin SDK")
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n").replace(/^["']|["']$/g, "")
          : undefined

        if (!privateKey) {
          throw new Error("FIREBASE_PRIVATE_KEY environment variable is not set or is empty")
        }

        const serviceAccount = {
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }

        credential = cert(serviceAccount)
      }

      initializeApp({
        credential,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      })

      console.log("Firebase Admin SDK initialized successfully")
    } catch (error) {
      console.error("Error initializing Firebase Admin SDK:", error)
      throw error
    }
  }

  return {
    messaging: getMessaging(),
    storage: getStorage(),
    auth: getAuth(),
    firestore: getFirestore(),
  }
}
