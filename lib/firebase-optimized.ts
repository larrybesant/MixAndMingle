// This file provides optimized Firebase imports to reduce bundle size

// Import only what you need from Firebase
import { initializeApp, getApps } from "firebase/app"

// Core Firebase services - import only what you use
const auth = () => import("firebase/auth").then(({ getAuth }) => getAuth())
const firestore = () =>
  import("firebase/firestore").then((module) => ({
    getFirestore: module.getFirestore,
    collection: module.collection,
    doc: module.doc,
    getDoc: module.getDoc,
    getDocs: module.getDocs,
    setDoc: module.setDoc,
    updateDoc: module.updateDoc,
    deleteDoc: module.deleteDoc,
    query: module.query,
    where: module.where,
    orderBy: module.orderBy,
    limit: module.limit,
    startAfter: module.startAfter,
    onSnapshot: module.onSnapshot,
  }))
const storage = () =>
  import("firebase/storage").then((module) => ({
    getStorage: module.getStorage,
    ref: module.ref,
    uploadBytes: module.uploadBytes,
    getDownloadURL: module.getDownloadURL,
    deleteObject: module.deleteObject,
    listAll: module.listAll,
  }))
const analytics = () => import("firebase/analytics").then(({ getAnalytics }) => getAnalytics())
const messaging = () => import("firebase/messaging").then(({ getMessaging }) => getMessaging())

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase only if it hasn't been initialized already
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]

// Export the app and lazy-loaded services
export { firebaseApp, auth, firestore, storage, analytics, messaging }

// Example usage:
// const authService = await auth();
// const user = await authService.signInWithEmailAndPassword(email, password);
