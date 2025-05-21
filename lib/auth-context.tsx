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
import { handleFirebaseError, retryOperation } from "@/lib/firebase-error-handler"

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
      const handledError = handleFirebaseError(error, {
        operation: "auth-listener-setup",
      })
      setError(handledError.originalError || new Error(handledError.message))
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

      // Use retry for network errors
      const result = await retryOperation(
        async () => signInWithEmailAndPassword(auth, email, password),
        3, // max retries
        1000, // initial delay in ms
      )

      // Update user's online status
      if (result.user) {
        try {
          await updateDoc(doc(db, "users", result.user.uid), {
            lastLogin: serverTimestamp(),
            onlineStatus: "online",
          })
        } catch (docError) {
          // Handle but don't fail the login
          handleFirebaseError(docError, {
            operation: "update-user-status",
            userId: result.user.uid,
          })
        }
      }

      return result
    } catch (error) {
      console.error("Email sign-in error:", error)
      const handledError = handleFirebaseError(error, {
        operation: "email-sign-in",
        additionalData: { email },
      })
      setError(handledError.originalError || new Error(handledError.message))
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

      // Use retry for network errors
      const result = await retryOperation(
        async () => signInWithPopup(auth, provider),
        2, // max retries
        1000, // initial delay in ms
      )

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
          // Handle but don't fail the login
          handleFirebaseError(docError, {
            operation: "google-sign-in-user-doc",
            userId: result.user.uid,
          })
        }
      }

      return result
    } catch (error) {
      console.error("Google sign-in error:", error)
      const handledError = handleFirebaseError(error, {
        operation: "google-sign-in",
      })
      setError(handledError.originalError || new Error(handledError.message))
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

      // Use retry for network errors
      const result = await retryOperation(
        async () => signInWithPopup(auth, provider),
        2, // max retries
        1000, // initial delay in ms
      )

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
          // Handle but don't fail the login
          handleFirebaseError(docError, {
            operation: "facebook-sign-in-user-doc",
            userId: result.user.uid,
          })
        }
      }

      return result
    } catch (error) {
      console.error("Facebook sign-in error:", error)
      const handledError = handleFirebaseError(error, {
        operation: "facebook-sign-in",
      })
      setError(handledError.originalError || new Error(handledError.message))
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
          // Handle but don't fail the signup
          handleFirebaseError(profileError, {
            operation: "sign-up-profile-update",
            userId: result.user.uid,
          })
        }
      }

      return result
    } catch (error) {
      console.error("Sign-up error:", error)
      const handledError = handleFirebaseError(error, {
        operation: "sign-up",
        additionalData: { email },
      })
      setError(handledError.originalError || new Error(handledError.message))
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
          // Handle but don't fail the sign out
          handleFirebaseError(docError, {
            operation: "sign-out-status-update",
            userId: user.uid,
          })
        }
      }

      await firebaseSignOut(auth)
    } catch (error) {
      console.error("Sign-out error:", error)
      const handledError = handleFirebaseError(error, {
        operation: "sign-out",
        userId: user?.uid,
      })
      setError(handledError.originalError || new Error(handledError.message))
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
      const handledError = handleFirebaseError(error, {
        operation: "update-profile",
        userId: auth.currentUser?.uid,
      })
      setError(handledError.originalError || new Error(handledError.message))
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
