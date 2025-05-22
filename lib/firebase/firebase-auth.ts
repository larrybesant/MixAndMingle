"use client"

import { initializeApp, getApps } from "firebase/app"
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth"

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
export const initializeFirebase = () => {
  if (getApps().length === 0) {
    try {
      const app = initializeApp(firebaseConfig)
      console.log("Firebase initialized successfully")
      return app
    } catch (error) {
      console.error("Firebase initialization error:", error)
      throw error
    }
  }
  return getApps()[0]
}

// Get Firebase Auth instance
export const getFirebaseAuth = () => {
  const app = initializeFirebase()
  return getAuth(app)
}

// Set persistence to LOCAL
export const setAuthPersistence = async () => {
  const auth = getFirebaseAuth()
  try {
    await setPersistence(auth, browserLocalPersistence)
    console.log("Auth persistence set to LOCAL successfully")
  } catch (error) {
    console.error("Error setting auth persistence:", error)
  }
}

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  try {
    const auth = getFirebaseAuth()
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { user: userCredential.user, error: null }
  } catch (error: any) {
    console.error("Sign in error:", error)
    return {
      user: null,
      error: {
        code: error.code,
        message: getAuthErrorMessage(error.code),
      },
    }
  }
}

// Sign up with email and password
export const signUp = async (email: string, password: string) => {
  try {
    const auth = getFirebaseAuth()
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return { user: userCredential.user, error: null }
  } catch (error: any) {
    console.error("Sign up error:", error)
    return {
      user: null,
      error: {
        code: error.code,
        message: getAuthErrorMessage(error.code),
      },
    }
  }
}

// Send password reset email
export const resetPassword = async (email: string) => {
  try {
    const auth = getFirebaseAuth()
    await sendPasswordResetEmail(auth, email)
    return { success: true, error: null }
  } catch (error: any) {
    console.error("Password reset error:", error)
    return {
      success: false,
      error: {
        code: error.code,
        message: getAuthErrorMessage(error.code),
      },
    }
  }
}

// Sign out
export const logOut = async () => {
  try {
    const auth = getFirebaseAuth()
    await firebaseSignOut(auth)
    return { success: true, error: null }
  } catch (error: any) {
    console.error("Sign out error:", error)
    return {
      success: false,
      error: {
        code: error.code,
        message: getAuthErrorMessage(error.code),
      },
    }
  }
}

// Listen to auth state changes
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  const auth = getFirebaseAuth()
  return onAuthStateChanged(auth, callback)
}

// Get user friendly error messages
export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/invalid-email":
      return "The email address is not valid."
    case "auth/user-disabled":
      return "This user account has been disabled."
    case "auth/user-not-found":
      return "No user found with this email address."
    case "auth/wrong-password":
      return "Incorrect password."
    case "auth/email-already-in-use":
      return "This email address is already in use."
    case "auth/weak-password":
      return "The password is too weak."
    case "auth/operation-not-allowed":
      return "This operation is not allowed."
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection."
    case "auth/internal-error":
      return "An internal error has occurred. Please try again later."
    case "auth/too-many-requests":
      return "Too many unsuccessful login attempts. Please try again later."
    case "auth/requires-recent-login":
      return "This operation requires recent authentication. Please log in again."
    default:
      return "An error occurred during authentication. Please try again."
  }
}

// Verify auth configuration
export const verifyAuthConfig = () => {
  const requiredEnvVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  ]

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(", ")}`)
    return false
  }

  return true
}
