"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  updateProfile,
  signOut,
  type User,
} from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

interface AuthUser extends User {
  isPremium?: boolean
  isVIP?: boolean
  role?: string
  customData?: any
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  logout: () => Promise<void>
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>
}

interface UserProfile {
  displayName?: string
  photoURL?: string
  bio?: string
  favoriteGenres?: string[]
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signInWithFacebook: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  // Sign up with email and password
  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
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
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
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
  }

  // Sign in with Facebook
  const signInWithFacebook = async () => {
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
  }

  // Sign out
  const logout = async () => {
    // Update online status before signing out
    if (user) {
      await updateDoc(doc(db, "users", user.uid), {
        onlineStatus: "offline",
        lastActive: new Date().toISOString(),
      })
    }

    await signOut(auth)
  }

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return

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
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
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

      setLoading(false)
    })

    // Set up online/offline detection
    const handleOnlineStatusChange = async () => {
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          onlineStatus: navigator.onLine ? "online" : "offline",
          lastActive: new Date().toISOString(),
        })
      }
    }

    window.addEventListener("online", handleOnlineStatusChange)
    window.addEventListener("offline", handleOnlineStatusChange)

    // Clean up on unmount
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
        await updateDoc(doc(db, "users", user.uid), {
          lastActive: new Date().toISOString(),
        })
      },
      5 * 60 * 1000,
    ) // Every 5 minutes

    return () => clearInterval(interval)
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithFacebook,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
