"use client"

import { useState, useEffect, useCallback } from "react"
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
  type UserCredential,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase-client"

export interface AuthUser extends User {
  isPremium?: boolean
  isVIP?: boolean
  role?: string
  customData?: any
}

interface UseAuthReturn {
  user: AuthUser | null
  loading: boolean
  error: Error | null
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<UserCredential>
  signInWithGoogle: () => Promise<UserCredential>
  signInWithFacebook: () => Promise<UserCredential>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>
  updateUserEmail: (newEmail: string, password: string) => Promise<void>
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>
  sendVerificationEmail: () => Promise<void>
  isEmailVerified: boolean
}

interface UserProfile {
  displayName?: string
  photoURL?: string
  bio?: string
  favoriteGenres?: string[]
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      try {
        if (authUser) {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, "users", authUser.uid))

          if (userDoc.exists()) {
            const userData = userDoc.data()
            // Merge auth user with Firestore data
            setUser({
              ...authUser,
              isPremium: userData.isPremium,
              isVIP: userData.isVIP,
              role: userData.role,
              customData: userData,
            })

            // Update online status
            await updateDoc(doc(db, "users", authUser.uid), {
              onlineStatus: "online",
              lastActive: new Date().toISOString(),
            })
          } else {
            setUser(authUser)
          }
        } else {
          setUser(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An unknown error occurred"))
        console.error("Error in auth state change:", err)
      } finally {
        setLoading(false)
      }
    })

    // Set up online/offline detection
    const handleOnlineStatusChange = async () => {
      if (user) {
        try {
          await updateDoc(doc(db, "users", user.uid), {
            onlineStatus: navigator.onLine ? "online" : "offline",
            lastActive: new Date().toISOString(),
          })
        } catch (err) {
          console.error("Error updating online status:", err)
        }
      }
    }

    window.addEventListener("online", handleOnlineStatusChange)
    window.addEventListener("offline", handleOnlineStatusChange)

    // Cleanup subscription on unmount
    return () => {
      unsubscribe()
      window.removeEventListener("online", handleOnlineStatusChange)
      window.removeEventListener("offline", handleOnlineStatusChange)
    }
  }, [user])

  // Update user's last active timestamp periodically
  useEffect(() => {
    if (!user) return

    const interval = setInterval(
      async () => {
        try {
          await updateDoc(doc(db, "users", user.uid), {
            lastActive: new Date().toISOString(),
          })
        } catch (err) {
          console.error("Error updating last active timestamp:", err)
        }
      },
      5 * 60 * 1000, // Every 5 minutes
    )

    return () => clearInterval(interval)
  }, [user])

  // Sign in with email and password
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      return await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign in"))
      throw err
    }
  }, [])

  // Sign up with email and password
  const signUpWithEmail = useCallback(async (email: string, password: string, displayName: string) => {
    setError(null)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName,
      })

      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        displayName,
        photoURL: null,
        createdAt: new Date().toISOString(),
        isPremium: false,
        isVIP: false,
        role: "user",
        onlineStatus: "online",
        lastActive: new Date().toISOString(),
      })

      return userCredential
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign up"))
      throw err
    }
  }, [])

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    setError(null)
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)

      // Check if user document exists, if not create it
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))

      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          createdAt: new Date().toISOString(),
          isPremium: false,
          isVIP: false,
          role: "user",
          onlineStatus: "online",
          lastActive: new Date().toISOString(),
        })
      } else {
        // Update last active and online status
        await updateDoc(doc(db, "users", userCredential.user.uid), {
          onlineStatus: "online",
          lastActive: new Date().toISOString(),
        })
      }

      return userCredential
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign in with Google"))
      throw err
    }
  }, [])

  // Sign in with Facebook
  const signInWithFacebook = useCallback(async () => {
    setError(null)
    try {
      const provider = new FacebookAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)

      // Check if user document exists, if not create it
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))

      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          createdAt: new Date().toISOString(),
          isPremium: false,
          isVIP: false,
          role: "user",
          onlineStatus: "online",
          lastActive: new Date().toISOString(),
        })
      } else {
        // Update last active and online status
        await updateDoc(doc(db, "users", userCredential.user.uid), {
          onlineStatus: "online",
          lastActive: new Date().toISOString(),
        })
      }

      return userCredential
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign in with Facebook"))
      throw err
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    setError(null)
    try {
      // Update online status before signing out
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          onlineStatus: "offline",
          lastActive: new Date().toISOString(),
        })
      }

      await firebaseSignOut(auth)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign out"))
      throw err
    }
  }, [user])

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    setError(null)
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to send password reset email"))
      throw err
    }
  }, [])

  // Update user profile
  const updateUserProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      setError(null)
      try {
        if (!user) throw new Error("No user is signed in")

        // Update Firebase Auth profile if displayName or photoURL is provided
        if (data.displayName || data.photoURL) {
          await updateProfile(user, {
            displayName: data.displayName || user.displayName,
            photoURL: data.photoURL || user.photoURL,
          })
        }

        // Update Firestore user document
        await updateDoc(doc(db, "users", user.uid), {
          ...data,
          updatedAt: new Date().toISOString(),
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to update profile"))
        throw err
      }
    },
    [user],
  )

  // Update user email
  const updateUserEmail = useCallback(
    async (newEmail: string, password: string) => {
      setError(null)
      try {
        if (!user) throw new Error("No user is signed in")

        // Re-authenticate user before changing email
        const credential = EmailAuthProvider.credential(user.email!, password)

        await reauthenticateWithCredential(user, credential)
        await updateEmail(user, newEmail)

        // Update email in Firestore
        await updateDoc(doc(db, "users", user.uid), {
          email: newEmail,
          updatedAt: new Date().toISOString(),
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to update email"))
        throw err
      }
    },
    [user],
  )

  // Update user password
  const updateUserPassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      setError(null)
      try {
        if (!user) throw new Error("No user is signed in")
        if (!user.email) throw new Error("User has no email")

        // Re-authenticate user before changing password
        const credential = EmailAuthProvider.credential(user.email, currentPassword)

        await reauthenticateWithCredential(user, credential)
        await updatePassword(user, newPassword)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to update password"))
        throw err
      }
    },
    [user],
  )

  // Send verification email
  const sendVerificationEmail = useCallback(async () => {
    setError(null)
    try {
      if (!user) throw new Error("No user is signed in")
      await sendEmailVerification(user)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to send verification email"))
      throw err
    }
  }, [user])

  return {
    user,
    loading,
    error,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    resetPassword,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    sendVerificationEmail,
    isEmailVerified: user?.emailVerified ?? false,
  }
}
