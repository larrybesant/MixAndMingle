import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getMessaging, isSupported } from "firebase/messaging"

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Initialize Firebase Cloud Messaging and export it conditionally
let messagingInstance: any = null

// This function safely initializes FCM only in supported environments
export const initializeMessaging = async () => {
  try {
    if (await isSupported()) {
      messagingInstance = getMessaging(app)
      return messagingInstance
    }
    return null
  } catch (error) {
    console.error("Error initializing Firebase messaging:", error)
    return null
  }
}

// Safe getter for messaging that won't break in unsupported environments
export const getMessagingInstance = () => messagingInstance

export default app
