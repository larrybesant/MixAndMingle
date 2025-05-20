"use client"

import { useState, useCallback } from "react"
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  type UserCredential,
} from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase-client"

interface UseSignInReturn {
  loading: boolean
  error: Error | null
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>
  signInWithGoogle: () => Promise<UserCredential>
  signInWithFacebook: () => Promise<UserCredential>
}

export function useSignIn(): UseSignInReturn {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)

      // Update online status
      await updateDoc(doc(db, "users", result.user.uid), {
        onlineStatus: "online",
        lastActive: new Date().toISOString(),
      })

      return result
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign in"))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)

      // Check if user document exists, if not create it
      const userDoc = await getDoc(doc(db, "users", result.user.uid))

      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: new Date().toISOString(),
          isPremium: false,
          isVIP: false,
          role: "user",
          onlineStatus: "online",
          lastActive: new Date().toISOString(),
        })
      } else {
        // Update last active and online status
        await updateDoc(doc(db, "users", result.user.uid), {
          onlineStatus: "online",
          lastActive: new Date().toISOString(),
        })
      }

      return result
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign in with Google"))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const signInWithFacebook = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const provider = new FacebookAuthProvider()
      const result = await signInWithPopup(auth, provider)

      // Check if user document exists, if not create it
      const userDoc = await getDoc(doc(db, "users", result.user.uid))

      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: new Date().toISOString(),
          isPremium: false,
          isVIP: false,
          role: "user",
          onlineStatus: "online",
          lastActive: new Date().toISOString(),
        })
      } else {
        // Update last active and online status
        await updateDoc(doc(db, "users", result.user.uid), {
          onlineStatus: "online",
          lastActive: new Date().toISOString(),
        })
      }

      return result
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign in with Facebook"))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    signInWithEmail,
    signInWithGoogle,
    signInWithFacebook,
  }
}
