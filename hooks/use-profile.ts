"use client"

import { useState, useCallback } from "react"
import { updateProfile as updateFirebaseProfile } from "firebase/auth"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase-client"
import { useAuthState } from "./use-auth-state"

interface ProfileData {
  displayName?: string
  photoURL?: string
  bio?: string
  location?: string
  website?: string
  interests?: string[]
  [key: string]: any
}

interface UseProfileReturn {
  loading: boolean
  error: Error | null
  profile: ProfileData | null
  updateProfile: (data: Partial<ProfileData>) => Promise<void>
  uploadProfileImage: (file: File) => Promise<string>
  fetchProfile: () => Promise<ProfileData | null>
}

export function useProfile(): UseProfileReturn {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const { user } = useAuthState()

  const fetchProfile = useCallback(async () => {
    if (!user) return null

    setLoading(true)
    setError(null)

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))

      if (userDoc.exists()) {
        const userData = userDoc.data() as ProfileData
        setProfile(userData)
        return userData
      }

      return null
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch profile"))
      throw err
    } finally {
      setLoading(false)
    }
  }, [user])

  const updateProfile = useCallback(
    async (data: Partial<ProfileData>) => {
      if (!user) throw new Error("No user is signed in")

      setLoading(true)
      setError(null)

      try {
        // Update Firebase Auth profile if displayName or photoURL is provided
        if (data.displayName || data.photoURL) {
          await updateFirebaseProfile(user, {
            displayName: data.displayName || user.displayName,
            photoURL: data.photoURL || user.photoURL,
          })
        }

        // Update Firestore user document
        await updateDoc(doc(db, "users", user.uid), {
          ...data,
          updatedAt: new Date().toISOString(),
        })

        // Update local profile state
        setProfile((prev) => (prev ? { ...prev, ...data } : null))
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to update profile"))
        throw err
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  const uploadProfileImage = useCallback(
    async (file: File) => {
      if (!user) throw new Error("No user is signed in")

      setLoading(true)
      setError(null)

      try {
        // Create a storage reference
        const storageRef = ref(storage, `profile_images/${user.uid}/${Date.now()}_${file.name}`)

        // Upload the file
        await uploadBytes(storageRef, file)

        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef)

        // Update the user's profile with the new photo URL
        await updateProfile({ photoURL: downloadURL })

        return downloadURL
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to upload profile image"))
        throw err
      } finally {
        setLoading(false)
      }
    },
    [user, updateProfile],
  )

  // Fetch profile on mount
  useState(() => {
    if (user && !profile) {
      fetchProfile().catch(console.error)
    }
  })

  return {
    loading,
    error,
    profile,
    updateProfile,
    uploadProfileImage,
    fetchProfile,
  }
}
