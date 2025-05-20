"use client"

import { useState, useCallback } from "react"
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  type UserCredential,
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase-client"

interface UseSignUpReturn {
  loading: boolean
  error: Error | null
  signUp: (email: string, password: string, displayName: string) => Promise<UserCredential>
  signUpWithVerification: (email: string, password: string, displayName: string) => Promise<UserCredential>
}

export function useSignUp(): UseSignUpReturn {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }, [])

  const signUpWithVerification = useCallback(async (email: string, password: string, displayName: string) => {
    setLoading(true)
    setError(null)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName,
      })

      // Send email verification
      await sendEmailVerification(userCredential.user)

      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        displayName,
        photoURL: null,
        createdAt: new Date().toISOString(),
        emailVerified: false,
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
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    signUp,
    signUpWithVerification,
  }
}
