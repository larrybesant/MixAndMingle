import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"
import { getStorage } from "firebase-admin/storage"
import { getMessaging } from "firebase-admin/messaging"

// Initialize Firebase Admin SDK function
export function initAdmin() {
  if (getApps().length === 0) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })
  }

  return {
    db: getFirestore(),
    auth: getAuth(),
    storage: getStorage(),
    messaging: getMessaging(),
  }
}

// Auto-initialize for direct exports
if (getApps().length === 0) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  })
}

// Direct exports for backward compatibility
export const db = getFirestore()
export const auth = getAuth()
export const storage = getStorage()
export const messaging = getMessaging()

// Helper function to get Firebase Admin instances (new pattern)
export function getAdmin() {
  return {
    db: getFirestore(),
    auth: getAuth(),
    storage: getStorage(),
    messaging: getMessaging(),
  }
}
