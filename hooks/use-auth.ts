"use client"

import { useState, useEffect, useCallback } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateProfile,
  type User,
  type UserCredential,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase-browser"

// Types
export interface AuthUser extends User {
  customData?: Record<string, any>
}

interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: Error | null
}

interface AuthActions {
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>
  signInWithGoogle: () => Promise<UserCredential>
  signInWithFacebook: () => Promise<UserCredential>
  signUp: (email: string, password: string, displayName: string) => Promise<UserCredential>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  confirmReset: (code: string, newPassword: string) => Promise<void>
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>
}

export type UseAuthReturn = AuthState & AuthActions

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Fetch additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          const customData = userDoc.exists() ? userDoc.data() : {}

          const authUser: AuthUser = user
          authUser.customData = customData

          setState({
            user: authUser,
            loading: false,
            error: null,
          })
        } catch (error) {
          console.error("Error fetching user data:", error)
          setState({
            user,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          })
        }
      } else {
        setState({
          user: null,
          loading: false,
          error: null,
        })
      }
    })

    return () => unsubscribe()
  }, [])

  // Sign in with email and password
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const result = await signInWithEmailAndPassword(auth, email, password)

      // Update last login timestamp
      await updateDoc(doc(db, "users", result.user.uid), {
        lastLogin: serverTimestamp(),
      })

      return result
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }))
      throw error
    }
  }, [])

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)

      // Check if this is a new user
      const userDoc = await getDoc(doc(db, "users", result.user.uid))

      if (!userDoc.exists()) {
        // Create a new user document
        await setDoc(doc(db, "users", result.user.uid), {
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          provider: "google",
        })
      } else {
        // Update last login timestamp
        await updateDoc(doc(db, "users", result.user.uid), {
          lastLogin: serverTimestamp(),
        })
      }

      return result
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }))
      throw error
    }
  }, [])

  // Sign in with Facebook
  const signInWithFacebook = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const provider = new FacebookAuthProvider()
      const result = await signInWithPopup(auth, provider)

      // Check if this is a new user
      const userDoc = await getDoc(doc(db, "users", result.user.uid))

      if (!userDoc.exists()) {
        // Create a new user document
        await setDoc(doc(db, "users", result.user.uid), {
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          provider: "facebook",
        })
      } else {
        // Update last login timestamp
        await updateDoc(doc(db, "users", result.user.uid), {
          lastLogin: serverTimestamp(),
        })
      }

      return result
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }))
      throw error
    }
  }, [])

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const result = await createUserWithEmailAndPassword(auth, email, password)

      // Update profile with display name
      await updateProfile(result.user, { displayName })

      // Create a new user document
      await setDoc(doc(db, "users", result.user.uid), {
        displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        provider: "email",
      })

      return result
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }))
      throw error
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      // Update online status before signing out
      if (state.user) {
        await updateDoc(doc(db, "users", state.user.uid), {
          online: false,
          lastSeen: serverTimestamp(),
        })
      }

      await firebaseSignOut(auth)
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }))
      throw error
    }
  }, [state.user])

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      await sendPasswordResetEmail(auth, email)
      setState((prev) => ({ ...prev, loading: false }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }))
      throw error
    }
  }, [])

  // Confirm password reset
  const confirmReset = useCallback(async (code: string, newPassword: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      await confirmPasswordReset(auth, code, newPassword)
      setState((prev) => ({ ...prev, loading: false }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }))
      throw error
    }
  }, [])

  // Update user profile
  const updateUserProfile = useCallback(
    async (data: { displayName?: string; photoURL?: string }) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }))

        if (!state.user) {
          throw new Error("No user is logged in")
        }

        // Update Firebase Auth profile
        await updateProfile(state.user, data)

        // Update Firestore user document
        await updateDoc(doc(db, "users", state.user.uid), {
          ...data,
          updatedAt: serverTimestamp(),
        })

        setState((prev) => ({ ...prev, loading: false }))
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        }))
        throw error
      }
    },
    [state.user],
  )

  return {
    ...state,
    signInWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    signUp,
    signOut,
    resetPassword,
    confirmReset,
    updateUserProfile,
  }
}
