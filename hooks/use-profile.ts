"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { updateProfile as updateAuthProfile } from "firebase/auth"
import { db } from "@/lib/firebase-client-safe"
import type { UserProfile, ProfileFormData } from "@/types/user-profile"
import { useAuth } from "@/lib/auth-context"

export function useProfile(userId?: string) {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Use the authenticated user's ID if no userId is provided
  const targetUserId = userId || authUser?.uid

  // Fetch user profile
  useEffect(() => {
    if (!targetUserId) {
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        const userDocRef = doc(db, "users", targetUserId)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile)
        } else if (targetUserId === authUser?.uid) {
          // If it's the current user and no profile exists, create a basic one
          const newProfile: UserProfile = {
            uid: authUser.uid,
            displayName: authUser.displayName || "New User",
            email: authUser.email || "",
            photoURL: authUser.photoURL || "",
            createdAt: new Date().toISOString(),
            isOnline: true,
            role: "user",
          }

          await setDoc(userDocRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
          })

          setProfile(newProfile)
        } else {
          setProfile(null)
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch profile"))
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [targetUserId, authUser])

  // Update user profile
  const updateProfile = async (data: ProfileFormData) => {
    if (!authUser || !targetUserId) {
      throw new Error("User not authenticated")
    }

    if (authUser.uid !== targetUserId) {
      throw new Error("Cannot update another user's profile")
    }

    try {
      setLoading(true)
      setError(null)

      const userDocRef = doc(db, "users", authUser.uid)

      // Update Firestore document
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })

      // Update Auth profile for basic fields
      await updateAuthProfile(authUser, {
        displayName: data.displayName,
      })

      // Refresh profile data
      const updatedDoc = await getDoc(userDocRef)
      setProfile(updatedDoc.data() as UserProfile)

      return true
    } catch (err) {
      console.error("Error updating profile:", err)
      setError(err instanceof Error ? err : new Error("Failed to update profile"))
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update profile photo
  const updateProfilePhoto = async (photoURL: string) => {
    if (!authUser || !targetUserId) {
      throw new Error("User not authenticated")
    }

    if (authUser.uid !== targetUserId) {
      throw new Error("Cannot update another user's profile")
    }

    try {
      setLoading(true)
      setError(null)

      const userDocRef = doc(db, "users", authUser.uid)

      // Update Firestore document
      await updateDoc(userDocRef, {
        photoURL,
        updatedAt: serverTimestamp(),
      })

      // Update Auth profile
      await updateAuthProfile(authUser, { photoURL })

      // Refresh profile data
      const updatedDoc = await getDoc(userDocRef)
      setProfile(updatedDoc.data() as UserProfile)

      return true
    } catch (err) {
      console.error("Error updating profile photo:", err)
      setError(err instanceof Error ? err : new Error("Failed to update profile photo"))
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
    updateProfilePhoto,
    isCurrentUser: authUser?.uid === targetUserId,
  }
}
