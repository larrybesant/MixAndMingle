"use client"

import { useState, useEffect, useCallback } from "react"
import {
  authService,
  firestoreService,
  storageService,
  analyticsService,
  messagingService,
  connectToEmulators,
} from "@/lib/firebase-service"

// Initialize emulators in development
if (typeof window !== "undefined") {
  connectToEmulators()
}

/**
 * Hook for using Firebase services with optimized imports
 */
export function useFirebase() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe: (() => void) | null = null

    const setupAuthListener = () => {
      authService
        .onAuthStateChanged((user) => {
          setUser(user)
          setLoading(false)
        })
        .catch((err) => {
          console.error("Error setting up auth listener:", err)
          setError(err instanceof Error ? err : new Error("Unknown error"))
          setLoading(false)
        })
    }

    setupAuthListener()

    // Clean up listener
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  // Log analytics event when user changes
  useEffect(() => {
    if (user) {
      analyticsService.logEvent("login", { method: user.providerData[0]?.providerId || "unknown" })
    }
  }, [user])

  // Wrap async functions to handle errors consistently
  const wrapAsync = useCallback((fn: () => Promise<any>, errorMessage: string) => {
    return fn().catch((err) => {
      console.error(`${errorMessage}:`, err)
      setError(err instanceof Error ? err : new Error(errorMessage))
      throw err
    })
  }, [])

  // Auth methods
  const signIn = useCallback(
    (email: string, password: string) => {
      return wrapAsync(() => authService.signInWithEmailAndPassword(email, password), "Failed to sign in")
    },
    [wrapAsync],
  )

  const signInWithGoogle = useCallback(() => {
    return wrapAsync(() => authService.signInWithGoogle(), "Failed to sign in with Google")
  }, [wrapAsync])

  const signUp = useCallback(
    (email: string, password: string) => {
      return wrapAsync(() => authService.createUserWithEmailAndPassword(email, password), "Failed to create account")
    },
    [wrapAsync],
  )

  const signOut = useCallback(() => {
    return wrapAsync(() => authService.signOut(), "Failed to sign out")
  }, [wrapAsync])

  const resetPassword = useCallback(
    (email: string) => {
      return wrapAsync(() => authService.sendPasswordResetEmail(email), "Failed to send password reset email")
    },
    [wrapAsync],
  )

  const updateProfile = useCallback(
    (profile: { displayName?: string; photoURL?: string }) => {
      if (!user) throw new Error("No user is signed in")

      return wrapAsync(() => authService.updateProfile(user, profile), "Failed to update profile")
    },
    [user, wrapAsync],
  )

  // Firestore methods
  const getDocument = useCallback(
    (collection: string, id: string) => {
      return wrapAsync(
        () => firestoreService.getDocument(collection, id),
        `Failed to get document ${id} from ${collection}`,
      )
    },
    [wrapAsync],
  )

  const getCollection = useCallback(
    (collection: string) => {
      return wrapAsync(() => firestoreService.getCollection(collection), `Failed to get collection ${collection}`)
    },
    [wrapAsync],
  )

  const addDocument = useCallback(
    (collection: string, data: any) => {
      return wrapAsync(() => firestoreService.addDocument(collection, data), `Failed to add document to ${collection}`)
    },
    [wrapAsync],
  )

  const setDocument = useCallback(
    (collection: string, id: string, data: any, options = { merge: true }) => {
      return wrapAsync(
        () => firestoreService.setDocument(collection, id, data, options),
        `Failed to set document ${id} in ${collection}`,
      )
    },
    [wrapAsync],
  )

  const updateDocument = useCallback(
    (collection: string, id: string, data: any) => {
      return wrapAsync(
        () => firestoreService.updateDocument(collection, id, data),
        `Failed to update document ${id} in ${collection}`,
      )
    },
    [wrapAsync],
  )

  const deleteDocument = useCallback(
    (collection: string, id: string) => {
      return wrapAsync(
        () => firestoreService.deleteDocument(collection, id),
        `Failed to delete document ${id} from ${collection}`,
      )
    },
    [wrapAsync],
  )

  const subscribeToDocument = useCallback(
    (collection: string, id: string, callback: (data: any) => void) => {
      return wrapAsync(
        () => firestoreService.onDocumentSnapshot(collection, id, callback),
        `Failed to subscribe to document ${id} in ${collection}`,
      )
    },
    [wrapAsync],
  )

  const subscribeToCollection = useCallback(
    (collection: string, callback: (data: any[]) => void) => {
      return wrapAsync(
        () => firestoreService.onCollectionSnapshot(collection, callback),
        `Failed to subscribe to collection ${collection}`,
      )
    },
    [wrapAsync],
  )

  // Storage methods
  const uploadFile = useCallback(
    (path: string, file: File, metadata?: any) => {
      return wrapAsync(() => storageService.uploadFile(path, file, metadata), `Failed to upload file to ${path}`)
    },
    [wrapAsync],
  )

  const uploadFileWithProgress = useCallback(
    (path: string, file: File, onProgress: (progress: number) => void) => {
      return wrapAsync(
        () => storageService.uploadFileWithProgress(path, file, onProgress),
        `Failed to upload file to ${path}`,
      )
    },
    [wrapAsync],
  )

  const getFileUrl = useCallback(
    (path: string) => {
      return wrapAsync(() => storageService.getDownloadURL(path), `Failed to get download URL for ${path}`)
    },
    [wrapAsync],
  )

  const deleteFile = useCallback(
    (path: string) => {
      return wrapAsync(() => storageService.deleteFile(path), `Failed to delete file at ${path}`)
    },
    [wrapAsync],
  )

  // Messaging methods
  const requestNotificationPermission = useCallback(() => {
    return wrapAsync(() => messagingService.requestPermission(), "Failed to request notification permission")
  }, [wrapAsync])

  const onMessageReceived = useCallback(
    (callback: (payload: any) => void) => {
      return wrapAsync(() => messagingService.onMessage(callback), "Failed to set up message listener")
    },
    [wrapAsync],
  )

  // Analytics methods
  const logEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    analyticsService.logEvent(eventName, params)
  }, [])

  return {
    // Auth
    user,
    loading,
    error,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    updateProfile,

    // Firestore
    getDocument,
    getCollection,
    addDocument,
    setDocument,
    updateDocument,
    deleteDocument,
    subscribeToDocument,
    subscribeToCollection,

    // Storage
    uploadFile,
    uploadFileWithProgress,
    getFileUrl,
    deleteFile,

    // Messaging
    requestNotificationPermission,
    onMessageReceived,

    // Analytics
    logEvent,
  }
}
