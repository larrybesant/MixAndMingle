"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase-client-safe"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: Error | null
  signInWithEmail: (email: string, password: string) => Promise<any>
  signInWithGoogle: () => Promise<any>
  signInWithFacebook: () => Promise<any>
  signUp: (email: string, password: string, displayName: string) => Promise<any>
  signOut: () => Promise<void>
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [authInitialized, setAuthInitialized] = useState(false)

  // Initialize auth state listener
  useEffect(() => {
    console.log("Setting up auth state listener")

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          console.log("Auth state changed:", user ? `User: ${user.uid}` : "No user")
          setUser(user)
          setLoading(false)
          setAuthInitialized(true)
        },
        (error) => {
          console.error("Auth state error:", error)
          setError(error)
          setLoading(false)
          setAuthInitialized(true)
        },
      )

      return () => unsubscribe()
    } catch (error) {
      console.error("Error setting up auth listener:", error)
      setError(error instanceof Error ? error : new Error(String(error)))
      setLoading(false)
      setAuthInitialized(true)
    }
  }, [])

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log("Signing in with email:", email)
      setError(null)

      if (!auth) {
        throw new Error("Authentication not initialized")
      }

      const result = await signInWithEmailAndPassword(auth, email, password)

      // Update user's online status
      if (result.user) {
        try {
          await updateDoc(doc(db, "users", result.user.uid), {
            lastLogin: serverTimestamp(),
            onlineStatus: "online",
          })
        } catch (docError) {
          console.error("Error updating user document:", docError)
          // Don't fail the login if this update fails
        }
      }

      return result
    } catch (error) {
      console.error("Email sign-in error:", error)
      setError(error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      console.log("Signing in with Google")
      setError(null)

      if (!auth) {
        throw new Error("Authentication not initialized")
      }

      const provider = new GoogleAuthProvider()
      provider.addScope("profile")
      provider.addScope("email")
      provider.setCustomParameters({
        prompt: "select_account",
      })
      const result = await signInWithPopup(auth, provider)

      // Create or update user document
      if (result.user) {
        try {
          const userDocRef = doc(db, "users", result.user.uid)
          const userDoc = await getDoc(userDocRef)

          if (!userDoc.exists()) {
            // Create new user document
            await setDoc(userDocRef, {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              onlineStatus: "online",
              provider: "google",
            })
          } else {
            // Update existing user
            await updateDoc(userDocRef, {
              lastLogin: serverTimestamp(),
              onlineStatus: "online",
            })
          }
        } catch (docError) {
          console.error("Error with user document:", docError)
          // Don't fail the login if this update fails
        }
      }

      return result
    } catch (error) {
      console.error("Google sign-in error:", error)
      setError(error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  // Sign in with Facebook
  const signInWithFacebook = async () => {
    try {
      console.log("Signing in with Facebook")
      setError(null)

      if (!auth) {
        throw new Error("Authentication not initialized")
      }

      const provider = new FacebookAuthProvider()
      const result = await signInWithPopup(auth, provider)

      // Create or update user document
      if (result.user) {
        try {
          const userDocRef = doc(db, "users", result.user.uid)
          const userDoc = await getDoc(userDocRef)

          if (!userDoc.exists()) {
            // Create new user document
            await setDoc(userDocRef, {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              onlineStatus: "online",
              provider: "facebook",
            })
          } else {
            // Update existing user
            await updateDoc(userDocRef, {
              lastLogin: serverTimestamp(),
              onlineStatus: "online",
            })
          }
        } catch (docError) {
          console.error("Error with user document:", docError)
          // Don't fail the login if this update fails
        }
      }

      return result
    } catch (error) {
      console.error("Facebook sign-in error:", error)
      setError(error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      console.log("Signing up with email:", email)
      setError(null)

      if (!auth) {
        throw new Error("Authentication not initialized")
      }

      // Create user with email and password
      const result = await createUserWithEmailAndPassword(auth, email, password)

      // Update profile with display name
      if (result.user) {
        try {
          await updateProfile(result.user, { displayName })

          // Create user document
          await setDoc(doc(db, "users", result.user.uid), {
            uid: result.user.uid,
            email: result.user.email,
            displayName,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            onlineStatus: "online",
            provider: "email",
          })
        } catch (profileError) {
          console.error("Error updating profile:", profileError)
          // Continue even if profile update fails
        }
      }

      return result
    } catch (error) {
      console.error("Sign-up error:", error)
      setError(error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  // Sign out
  const handleSignOut = async () => {
    try {
      console.log("Signing out")
      setError(null)

      if (!auth) {
        throw new Error("Authentication not initialized")
      }

      // Update online status if user exists
      if (user) {
        try {
          await updateDoc(doc(db, "users", user.uid), {
            onlineStatus: "offline",
            lastSeen: serverTimestamp(),
          })
        } catch (docError) {
          console.error("Error updating online status:", docError)
          // Continue with sign out even if this fails
        }
      }

      await firebaseSignOut(auth)
    } catch (error) {
      console.error("Sign-out error:", error)
      setError(error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  // Update user profile
  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    try {
      console.log("Updating user profile")
      setError(null)

      if (!auth.currentUser) {
        throw new Error("No authenticated user")
      }

      await updateProfile(auth.currentUser, data)

      // Update Firestore document
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        ...data,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Profile update error:", error)
      setError(error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  const value = {
    user,
    loading: loading || !authInitialized,
    error,
    signInWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    signUp,
    signOut: handleSignOut,
    updateUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
