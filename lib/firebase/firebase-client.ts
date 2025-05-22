"use client"

import { initializeApp, getApps } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getStorage, connectStorageEmulator, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getDatabase, connectDatabaseEmulator } from "firebase/database"
import { getMessaging, getToken, onMessage } from "firebase/messaging"
import { getAnalytics } from "firebase/analytics"

// Firebase client configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
}

// Add the missing export for initializeFirebase
export function initializeFirebase() {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig)
  } else {
    return getApps()[0]
  }
}

// Initialize Firebase client if it hasn't been initialized already
export function initializeFirebaseClient() {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig)
  } else {
    return getApps()[0]
  }
}

// Get Firebase Auth instance
export function getFirebaseAuth() {
  const app = initializeFirebaseClient()
  const auth = getAuth(app)

  // Connect to Auth emulator in development if configured
  if (process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === "true" && process.env.NODE_ENV === "development") {
    connectAuthEmulator(auth, "http://localhost:9099")
  }

  return auth
}

// Get Firebase Storage instance
export function getFirebaseStorage() {
  const app = initializeFirebaseClient()
  const storage = getStorage(app)

  // Connect to Storage emulator in development if configured
  if (process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === "true" && process.env.NODE_ENV === "development") {
    connectStorageEmulator(storage, "localhost", 9199)
  }

  return storage
}

// Get Firebase Firestore instance
export function getFirebaseFirestore() {
  const app = initializeFirebaseClient()
  const firestore = getFirestore(app)

  // Connect to Firestore emulator in development if configured
  if (process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === "true" && process.env.NODE_ENV === "development") {
    connectFirestoreEmulator(firestore, "localhost", 8080)
  }

  return firestore
}

// Get Firebase Realtime Database instance
export function getFirebaseDatabase() {
  const app = initializeFirebaseClient()
  const database = getDatabase(app)

  // Connect to Database emulator in development if configured
  if (process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === "true" && process.env.NODE_ENV === "development") {
    connectDatabaseEmulator(database, "localhost", 9000)
  }

  return database
}

// Get Firebase Messaging instance (only in browser)
export function getFirebaseMessaging() {
  if (typeof window !== "undefined" && "Notification" in window) {
    const app = initializeFirebaseClient()
    try {
      return getMessaging(app)
    } catch (error) {
      console.error("Error initializing Firebase Messaging:", error)
      return null
    }
  }
  return null
}

// Initialize Analytics (only in browser)
export function initializeAnalytics() {
  if (typeof window !== "undefined") {
    const app = initializeFirebaseClient()
    try {
      return getAnalytics(app)
    } catch (error) {
      console.error("Error initializing Firebase Analytics:", error)
      return null
    }
  }
  return null
}

// Upload file to Firebase Storage
export async function uploadFile(file: File, path: string): Promise<string> {
  try {
    const storage = getFirebaseStorage()
    const storageRef = ref(storage, path)

    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

// Fetch VAPID key from server
async function fetchVapidKey() {
  try {
    const response = await fetch("/api/firebase/vapid-key")
    if (!response.ok) {
      throw new Error("Failed to fetch VAPID key")
    }
    const data = await response.json()
    return data.vapidKey
  } catch (error) {
    console.error("Error fetching VAPID key:", error)
    return null
  }
}

// Request permission and get FCM token
export async function requestNotificationPermission() {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.log("This browser does not support notifications")
      return null
    }

    const app = initializeFirebaseClient()
    const messaging = getMessaging(app)

    // Request permission
    const permission = await Notification.requestPermission()

    if (permission !== "granted") {
      console.log("Notification permission not granted")
      return null
    }

    // Fetch VAPID key from server
    const vapidKey = await fetchVapidKey()

    if (!vapidKey) {
      console.error("Failed to get VAPID key from server")
      return null
    }

    // Get token
    const token = await getToken(messaging, {
      vapidKey: vapidKey,
    })

    console.log("FCM Token:", token)
    return token
  } catch (error) {
    console.error("Error requesting notification permission:", error)
    return null
  }
}

// Set up foreground message handler
export function setupMessageListener(callback: (payload: any) => void) {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return () => {}
    }

    const app = initializeFirebaseClient()
    const messaging = getMessaging(app)

    // Handle foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Received foreground message:", payload)
      callback(payload)
    })

    return unsubscribe
  } catch (error) {
    console.error("Error setting up message listener:", error)
    return () => {}
  }
}
