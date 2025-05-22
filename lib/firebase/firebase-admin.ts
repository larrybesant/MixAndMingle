import admin from "../firebase-admin"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"
import { getMessaging } from "firebase-admin/messaging"

// Export the admin instance
export default admin

// Export convenience functions to access Firebase services
export function getFirebaseAuth() {
  return getAuth()
}

export function getFirebaseFirestore() {
  return getFirestore()
}

export function getFirebaseStorage() {
  return getStorage()
}

export function getFirebaseMessaging() {
  return getMessaging()
}

// Export a function to initialize Firebase Admin (for explicit initialization if needed)
export function initializeFirebaseAdmin() {
  // The initialization happens automatically when the module is imported
  return {
    auth: getFirebaseAuth(),
    firestore: getFirebaseFirestore(),
    storage: getFirebaseStorage(),
    messaging: getFirebaseMessaging(),
  }
}
