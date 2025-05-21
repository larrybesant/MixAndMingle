/**
 * Centralized Firebase Service with Dynamic Imports
 *
 * This service provides access to Firebase functionality while optimizing bundle size
 * by using dynamic imports to load Firebase modules only when needed.
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app"

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase only once
let firebaseApp: FirebaseApp

try {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig)
    console.log("Firebase initialized successfully")
  } else {
    firebaseApp = getApps()[0]
  }
} catch (error) {
  console.error("Error initializing Firebase:", error)
  throw new Error("Failed to initialize Firebase. Check your configuration.")
}

/**
 * Authentication Service
 * Dynamically imports Firebase Auth when needed
 */
export const authService = {
  /**
   * Get the Auth instance
   */
  getAuth: async () => {
    const { getAuth } = await import("firebase/auth")
    return getAuth(firebaseApp)
  },

  /**
   * Sign in with email and password
   */
  signInWithEmailAndPassword: async (email: string, password: string) => {
    const { getAuth, signInWithEmailAndPassword } = await import("firebase/auth")
    const auth = getAuth(firebaseApp)
    return signInWithEmailAndPassword(auth, email, password)
  },

  /**
   * Sign in with Google
   */
  signInWithGoogle: async () => {
    const { getAuth, GoogleAuthProvider, signInWithPopup } = await import("firebase/auth")
    const auth = getAuth(firebaseApp)
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  },

  /**
   * Create a new user with email and password
   */
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    const { getAuth, createUserWithEmailAndPassword } = await import("firebase/auth")
    const auth = getAuth(firebaseApp)
    return createUserWithEmailAndPassword(auth, email, password)
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    const { getAuth, signOut } = await import("firebase/auth")
    const auth = getAuth(firebaseApp)
    return signOut(auth)
  },

  /**
   * Get the current user
   */
  getCurrentUser: async () => {
    const { getAuth } = await import("firebase/auth")
    const auth = getAuth(firebaseApp)
    return auth.currentUser
  },

  /**
   * Set up an auth state change listener
   */
  onAuthStateChanged: async (callback: (user: any) => void) => {
    const { getAuth, onAuthStateChanged } = await import("firebase/auth")
    const auth = getAuth(firebaseApp)
    return onAuthStateChanged(auth, callback)
  },

  /**
   * Send password reset email
   */
  sendPasswordResetEmail: async (email: string) => {
    const { getAuth, sendPasswordResetEmail } = await import("firebase/auth")
    const auth = getAuth(firebaseApp)
    return sendPasswordResetEmail(auth, email)
  },

  /**
   * Update user profile
   */
  updateProfile: async (user: any, profile: { displayName?: string; photoURL?: string }) => {
    const { updateProfile } = await import("firebase/auth")
    return updateProfile(user, profile)
  },
}

/**
 * Firestore Service
 * Dynamically imports Firestore when needed
 */
export const firestoreService = {
  /**
   * Get the Firestore instance
   */
  getFirestore: async () => {
    const { getFirestore } = await import("firebase/firestore")
    return getFirestore(firebaseApp)
  },

  /**
   * Get a document from Firestore
   */
  getDocument: async (collection: string, id: string) => {
    const { getFirestore, doc, getDoc } = await import("firebase/firestore")
    const db = getFirestore(firebaseApp)
    const docRef = doc(db, collection, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    } else {
      return null
    }
  },

  /**
   * Get multiple documents from a collection
   */
  getCollection: async (collectionName: string) => {
    const { getFirestore, collection, getDocs } = await import("firebase/firestore")
    const db = getFirestore(firebaseApp)
    const querySnapshot = await getDocs(collection(db, collectionName))

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  },

  /**
   * Add a document to a collection
   */
  addDocument: async (collectionName: string, data: any) => {
    const { getFirestore, collection, addDoc, serverTimestamp } = await import("firebase/firestore")
    const db = getFirestore(firebaseApp)

    // Add timestamps
    const documentData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, collectionName), documentData)
    return docRef.id
  },

  /**
   * Set a document with a specific ID
   */
  setDocument: async (collectionName: string, id: string, data: any, options = { merge: true }) => {
    const { getFirestore, doc, setDoc, serverTimestamp } = await import("firebase/firestore")
    const db = getFirestore(firebaseApp)

    // Add timestamps
    const documentData = {
      ...data,
      updatedAt: serverTimestamp(),
    }

    if (!options.merge) {
      documentData.createdAt = serverTimestamp()
    }

    await setDoc(doc(db, collectionName, id), documentData, options)
    return id
  },

  /**
   * Update a document
   */
  updateDocument: async (collectionName: string, id: string, data: any) => {
    const { getFirestore, doc, updateDoc, serverTimestamp } = await import("firebase/firestore")
    const db = getFirestore(firebaseApp)

    // Add updated timestamp
    const documentData = {
      ...data,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(doc(db, collectionName, id), documentData)
    return id
  },

  /**
   * Delete a document
   */
  deleteDocument: async (collectionName: string, id: string) => {
    const { getFirestore, doc, deleteDoc } = await import("firebase/firestore")
    const db = getFirestore(firebaseApp)
    await deleteDoc(doc(db, collectionName, id))
    return id
  },

  /**
   * Query documents in a collection
   */
  queryDocuments: async (collectionName: string, queryFn: (module: any) => any) => {
    const firestoreModule = await import("firebase/firestore")
    const { getFirestore, collection, getDocs } = firestoreModule
    const db = getFirestore(firebaseApp)

    // Build the query using the provided function
    const q = queryFn(firestoreModule)(collection(db, collectionName))

    // Execute the query
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  },

  /**
   * Set up a real-time listener on a document
   */
  onDocumentSnapshot: async (collectionName: string, id: string, callback: (data: any) => void) => {
    const { getFirestore, doc, onSnapshot } = await import("firebase/firestore")
    const db = getFirestore(firebaseApp)

    return onSnapshot(doc(db, collectionName, id), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() })
      } else {
        callback(null)
      }
    })
  },

  /**
   * Set up a real-time listener on a collection
   */
  onCollectionSnapshot: async (collectionName: string, callback: (data: any[]) => void) => {
    const { getFirestore, collection, onSnapshot } = await import("firebase/firestore")
    const db = getFirestore(firebaseApp)

    return onSnapshot(collection(db, collectionName), (querySnapshot) => {
      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      callback(documents)
    })
  },

  /**
   * Get Firestore query operators
   */
  getOperators: async () => {
    const { where, orderBy, limit, startAfter, endBefore, startAt, endAt } = await import("firebase/firestore")
    return { where, orderBy, limit, startAfter, endBefore, startAt, endAt }
  },
}

/**
 * Storage Service
 * Dynamically imports Firebase Storage when needed
 */
export const storageService = {
  /**
   * Get the Storage instance
   */
  getStorage: async () => {
    const { getStorage } = await import("firebase/storage")
    return getStorage(firebaseApp)
  },

  /**
   * Upload a file to Storage
   */
  uploadFile: async (path: string, file: File, metadata?: any) => {
    const { getStorage, ref, uploadBytes, getDownloadURL } = await import("firebase/storage")
    const storage = getStorage(firebaseApp)
    const storageRef = ref(storage, path)

    const snapshot = await uploadBytes(storageRef, file, metadata)
    const downloadURL = await getDownloadURL(snapshot.ref)

    return {
      path,
      downloadURL,
      metadata: snapshot.metadata,
    }
  },

  /**
   * Upload a file with progress tracking
   */
  uploadFileWithProgress: async (path: string, file: File, onProgress: (progress: number) => void) => {
    const { getStorage, ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage")
    const storage = getStorage(firebaseApp)
    const storageRef = ref(storage, path)

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          onProgress(progress)
        },
        (error) => {
          reject(error)
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          resolve({
            path,
            downloadURL,
            metadata: uploadTask.snapshot.metadata,
          })
        },
      )
    })
  },

  /**
   * Get a download URL for a file
   */
  getDownloadURL: async (path: string) => {
    const { getStorage, ref, getDownloadURL } = await import("firebase/storage")
    const storage = getStorage(firebaseApp)
    return getDownloadURL(ref(storage, path))
  },

  /**
   * Delete a file from Storage
   */
  deleteFile: async (path: string) => {
    const { getStorage, ref, deleteObject } = await import("firebase/storage")
    const storage = getStorage(firebaseApp)
    await deleteObject(ref(storage, path))
    return path
  },

  /**
   * List all files in a directory
   */
  listFiles: async (path: string) => {
    const { getStorage, ref, listAll } = await import("firebase/storage")
    const storage = getStorage(firebaseApp)
    const listResult = await listAll(ref(storage, path))

    return {
      items: listResult.items,
      prefixes: listResult.prefixes,
    }
  },
}

/**
 * Analytics Service
 * Dynamically imports Firebase Analytics when needed
 */
export const analyticsService = {
  /**
   * Get the Analytics instance
   */
  getAnalytics: async () => {
    // Only import analytics in the browser
    if (typeof window !== "undefined") {
      try {
        const { getAnalytics } = await import("firebase/analytics")
        return getAnalytics(firebaseApp)
      } catch (error) {
        console.error("Error initializing analytics:", error)
        return null
      }
    }
    return null
  },

  /**
   * Log an event to Analytics
   */
  logEvent: async (eventName: string, eventParams?: Record<string, any>) => {
    if (typeof window !== "undefined") {
      try {
        const { getAnalytics, logEvent } = await import("firebase/analytics")
        const analytics = getAnalytics(firebaseApp)
        logEvent(analytics, eventName, eventParams)
      } catch (error) {
        console.error("Error logging analytics event:", error)
      }
    }
  },

  /**
   * Set user properties in Analytics
   */
  setUserProperties: async (properties: Record<string, any>) => {
    if (typeof window !== "undefined") {
      try {
        const { getAnalytics, setUserProperties } = await import("firebase/analytics")
        const analytics = getAnalytics(firebaseApp)
        setUserProperties(analytics, properties)
      } catch (error) {
        console.error("Error setting user properties:", error)
      }
    }
  },
}

/**
 * Messaging Service
 * Dynamically imports Firebase Cloud Messaging when needed
 */
export const messagingService = {
  /**
   * Get the Messaging instance
   */
  getMessaging: async () => {
    if (typeof window !== "undefined") {
      try {
        const { getMessaging } = await import("firebase/messaging")
        return getMessaging(firebaseApp)
      } catch (error) {
        console.error("Error initializing messaging:", error)
        return null
      }
    }
    return null
  },

  /**
   * Request permission for notifications and get FCM token
   */
  requestPermission: async () => {
    if (typeof window !== "undefined") {
      try {
        // First, request notification permission
        const permission = await Notification.requestPermission()
        if (permission !== "granted") {
          throw new Error("Notification permission denied")
        }

        // Fetch the VAPID key from the server
        const response = await fetch("/api/config/vapid-key")
        if (!response.ok) {
          throw new Error("Failed to fetch VAPID key from server")
        }

        const data = await response.json()
        if (!data.vapidKey) {
          throw new Error("VAPID key not available")
        }

        // Now get the FCM token with the VAPID key from the server
        const { getMessaging, getToken } = await import("firebase/messaging")
        const messaging = getMessaging(firebaseApp)
        const token = await getToken(messaging, {
          vapidKey: data.vapidKey,
        })

        return token
      } catch (error) {
        console.error("Error requesting notification permission:", error)
        throw error
      }
    }
    return null
  },

  /**
   * Set up a message listener
   */
  onMessage: async (callback: (payload: any) => void) => {
    if (typeof window !== "undefined") {
      try {
        const { getMessaging, onMessage } = await import("firebase/messaging")
        const messaging = getMessaging(firebaseApp)
        return onMessage(messaging, callback)
      } catch (error) {
        console.error("Error setting up message listener:", error)
      }
    }
  },
}

// Export a function to check if Firebase is initialized
export const isFirebaseInitialized = () => !!firebaseApp

// Export the Firebase app instance for advanced use cases
export const getFirebaseApp = () => firebaseApp

// Export a utility to connect to Firebase emulators in development
export const connectToEmulators = async () => {
  if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true") {
    try {
      // Connect Auth emulator
      const { getAuth, connectAuthEmulator } = await import("firebase/auth")
      const auth = getAuth(firebaseApp)
      connectAuthEmulator(auth, "http://localhost:9099")

      // Connect Firestore emulator
      const { getFirestore, connectFirestoreEmulator } = await import("firebase/firestore")
      const db = getFirestore(firebaseApp)
      connectFirestoreEmulator(db, "localhost", 8080)

      // Connect Storage emulator
      const { getStorage, connectStorageEmulator } = await import("firebase/storage")
      const storage = getStorage(firebaseApp)
      connectStorageEmulator(storage, "localhost", 9199)

      console.log("Connected to Firebase emulators")
    } catch (error) {
      console.error("Error connecting to Firebase emulators:", error)
    }
  }
}
