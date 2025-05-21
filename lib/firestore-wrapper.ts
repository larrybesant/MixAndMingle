import { db } from "@/lib/firebase-client-safe"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type DocumentReference,
  type DocumentData,
  type QueryConstraint,
  serverTimestamp,
  runTransaction,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore"
import { handleFirebaseError, retryOperation } from "@/lib/firebase-error-handler"

// Generic type for document data
export type FirestoreData = Record<string, any>

// Options for get operations
export interface GetOptions {
  maxRetries?: number
  initialDelayMs?: number
}

// Options for write operations
export interface WriteOptions {
  maxRetries?: number
  initialDelayMs?: number
  merge?: boolean
}

// Options for query operations
export interface QueryOptions {
  maxRetries?: number
  initialDelayMs?: number
  limit?: number
  orderByField?: string
  orderDirection?: "asc" | "desc"
  startAfterDoc?: DocumentData
}

// Options for delete operations
export interface DeleteOptions {
  maxRetries?: number
  initialDelayMs?: number
}

// Options for transaction operations
export interface TransactionOptions {
  maxRetries?: number
  initialDelayMs?: number
}

// Options for batch operations
export interface BatchOptions {
  maxRetries?: number
  initialDelayMs?: number
}

// Options for subscribe operations
export interface SubscribeOptions {
  onError?: (error: any) => void
}

/**
 * Firestore wrapper with error handling
 */
export const firestoreWrapper = {
  /**
   * Get a document by ID
   */
  async getDocument<T extends FirestoreData = FirestoreData>(
    collectionPath: string,
    docId: string,
    options: GetOptions = {},
  ): Promise<T | null> {
    const { maxRetries = 3, initialDelayMs = 1000 } = options

    try {
      return await retryOperation(
        async () => {
          const docRef = doc(db, collectionPath, docId)
          const docSnap = await getDoc(docRef)

          if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as T
          }

          return null
        },
        maxRetries,
        initialDelayMs,
      )
    } catch (error) {
      throw handleFirebaseError(error, {
        operation: "get-document",
        path: `${collectionPath}/${docId}`,
      })
    }
  },

  /**
   * Create or update a document
   */
  async setDocument<T extends FirestoreData = FirestoreData>(
    collectionPath: string,
    docId: string,
    data: T,
    options: WriteOptions = {},
  ): Promise<void> {
    const { maxRetries = 3, initialDelayMs = 1000, merge = true } = options

    try {
      return await retryOperation(
        async () => {
          const docRef = doc(db, collectionPath, docId)

          // Add timestamps
          const dataWithTimestamps = {
            ...data,
            updatedAt: serverTimestamp(),
          }

          // Add createdAt for new documents
          if (merge) {
            const docSnap = await getDoc(docRef)
            if (!docSnap.exists()) {
              ;(dataWithTimestamps as any).createdAt = serverTimestamp()
            }
          } else {
            ;(dataWithTimestamps as any).createdAt = serverTimestamp()
          }

          await setDoc(docRef, dataWithTimestamps, { merge })
        },
        maxRetries,
        initialDelayMs,
      )
    } catch (error) {
      throw handleFirebaseError(error, {
        operation: "set-document",
        path: `${collectionPath}/${docId}`,
      })
    }
  },

  /**
   * Update a document
   */
  async updateDocument<T extends Partial<FirestoreData> = Partial<FirestoreData>>(
    collectionPath: string,
    docId: string,
    data: T,
    options: WriteOptions = {},
  ): Promise<void> {
    const { maxRetries = 3, initialDelayMs = 1000 } = options

    try {
      return await retryOperation(
        async () => {
          const docRef = doc(db, collectionPath, docId)

          // Add updatedAt timestamp
          const dataWithTimestamp = {
            ...data,
            updatedAt: serverTimestamp(),
          }

          await updateDoc(docRef, dataWithTimestamp)
        },
        maxRetries,
        initialDelayMs,
      )
    } catch (error) {
      throw handleFirebaseError(error, {
        operation: "update-document",
        path: `${collectionPath}/${docId}`,
      })
    }
  },

  /**
   * Delete a document
   */
  async deleteDocument(collectionPath: string, docId: string, options: DeleteOptions = {}): Promise<void> {
    const { maxRetries = 3, initialDelayMs = 1000 } = options

    try {
      return await retryOperation(
        async () => {
          const docRef = doc(db, collectionPath, docId)
          await deleteDoc(docRef)
        },
        maxRetries,
        initialDelayMs,
      )
    } catch (error) {
      throw handleFirebaseError(error, {
        operation: "delete-document",
        path: `${collectionPath}/${docId}`,
      })
    }
  },

  /**
   * Query documents
   */
  async queryDocuments<T extends FirestoreData = FirestoreData>(
    collectionPath: string,
    constraints: QueryConstraint[] = [],
    options: QueryOptions = {},
  ): Promise<T[]> {
    const {
      maxRetries = 3,
      initialDelayMs = 1000,
      limit: limitCount,
      orderByField,
      orderDirection = "asc",
      startAfterDoc,
    } = options

    try {
      return await retryOperation(
        async () => {
          const queryConstraints = [...constraints]

          // Add orderBy if specified
          if (orderByField) {
            queryConstraints.push(orderBy(orderByField, orderDirection))
          }

          // Add limit if specified
          if (limitCount) {
            queryConstraints.push(limit(limitCount))
          }

          // Add startAfter if specified
          if (startAfterDoc) {
            queryConstraints.push(startAfter(startAfterDoc))
          }

          const q = query(collection(db, collectionPath), ...queryConstraints)
          const querySnapshot = await getDocs(q)

          const results: T[] = []
          querySnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() } as T)
          })

          return results
        },
        maxRetries,
        initialDelayMs,
      )
    } catch (error) {
      throw handleFirebaseError(error, {
        operation: "query-documents",
        path: collectionPath,
      })
    }
  },

  /**
   * Run a transaction
   */
  async runTransaction<T = any>(
    updateFunction: (transaction: any) => Promise<T>,
    options: TransactionOptions = {},
  ): Promise<T> {
    const { maxRetries = 3, initialDelayMs = 1000 } = options

    try {
      return await retryOperation(
        async () => {
          return await runTransaction(db, updateFunction)
        },
        maxRetries,
        initialDelayMs,
      )
    } catch (error) {
      throw handleFirebaseError(error, {
        operation: "run-transaction",
      })
    }
  },

  /**
   * Create and commit a batch
   */
  async runBatch(batchFunction: (batch: any) => void, options: BatchOptions = {}): Promise<void> {
    const { maxRetries = 3, initialDelayMs = 1000 } = options

    try {
      return await retryOperation(
        async () => {
          const batch = writeBatch(db)
          batchFunction(batch)
          await batch.commit()
        },
        maxRetries,
        initialDelayMs,
      )
    } catch (error) {
      throw handleFirebaseError(error, {
        operation: "run-batch",
      })
    }
  },

  /**
   * Increment a field in a document
   */
  async incrementField(
    collectionPath: string,
    docId: string,
    field: string,
    value = 1,
    options: WriteOptions = {},
  ): Promise<void> {
    const { maxRetries = 3, initialDelayMs = 1000 } = options

    try {
      return await retryOperation(
        async () => {
          const docRef = doc(db, collectionPath, docId)
          await updateDoc(docRef, {
            [field]: increment(value),
            updatedAt: serverTimestamp(),
          })
        },
        maxRetries,
        initialDelayMs,
      )
    } catch (error) {
      throw handleFirebaseError(error, {
        operation: "increment-field",
        path: `${collectionPath}/${docId}`,
        additionalData: { field, value },
      })
    }
  },

  /**
   * Add an item to an array field
   */
  async addToArray(
    collectionPath: string,
    docId: string,
    field: string,
    value: any,
    options: WriteOptions = {},
  ): Promise<void> {
    const { maxRetries = 3, initialDelayMs = 1000 } = options

    try {
      return await retryOperation(
        async () => {
          const docRef = doc(db, collectionPath, docId)
          await updateDoc(docRef, {
            [field]: arrayUnion(value),
            updatedAt: serverTimestamp(),
          })
        },
        maxRetries,
        initialDelayMs,
      )
    } catch (error) {
      throw handleFirebaseError(error, {
        operation: "add-to-array",
        path: `${collectionPath}/${docId}`,
        additionalData: { field },
      })
    }
  },

  /**
   * Remove an item from an array field
   */
  async removeFromArray(
    collectionPath: string,
    docId: string,
    field: string,
    value: any,
    options: WriteOptions = {},
  ): Promise<void> {
    const { maxRetries = 3, initialDelayMs = 1000 } = options

    try {
      return await retryOperation(
        async () => {
          const docRef = doc(db, collectionPath, docId)
          await updateDoc(docRef, {
            [field]: arrayRemove(value),
            updatedAt: serverTimestamp(),
          })
        },
        maxRetries,
        initialDelayMs,
      )
    } catch (error) {
      throw handleFirebaseError(error, {
        operation: "remove-from-array",
        path: `${collectionPath}/${docId}`,
        additionalData: { field },
      })
    }
  },

  /**
   * Subscribe to a document
   */
  subscribeToDocument<T extends FirestoreData = FirestoreData>(
    collectionPath: string,
    docId: string,
    callback: (data: T | null) => void,
    options: SubscribeOptions = {},
  ): Unsubscribe {
    const { onError } = options

    try {
      const docRef = doc(db, collectionPath, docId)

      return onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            callback({ id: docSnap.id, ...docSnap.data() } as T)
          } else {
            callback(null)
          }
        },
        (error) => {
          const handledError = handleFirebaseError(error, {
            operation: "subscribe-to-document",
            path: `${collectionPath}/${docId}`,
          })

          if (onError) {
            onError(handledError)
          } else {
            console.error("Error in document subscription:", handledError)
          }
        },
      )
    } catch (error) {
      const handledError = handleFirebaseError(error, {
        operation: "subscribe-to-document-setup",
        path: `${collectionPath}/${docId}`,
      })

      if (onError) {
        onError(handledError)
      } else {
        console.error("Error setting up document subscription:", handledError)
      }

      // Return a no-op unsubscribe function
      return () => {}
    }
  },

  /**
   * Subscribe to a query
   */
  subscribeToQuery<T extends FirestoreData = FirestoreData>(
    collectionPath: string,
    constraints: QueryConstraint[] = [],
    callback: (data: T[]) => void,
    options: SubscribeOptions = {},
  ): Unsubscribe {
    const { onError } = options

    try {
      const q = query(collection(db, collectionPath), ...constraints)

      return onSnapshot(
        q,
        (querySnapshot) => {
          const results: T[] = []
          querySnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() } as T)
          })
          callback(results)
        },
        (error) => {
          const handledError = handleFirebaseError(error, {
            operation: "subscribe-to-query",
            path: collectionPath,
          })

          if (onError) {
            onError(handledError)
          } else {
            console.error("Error in query subscription:", handledError)
          }
        },
      )
    } catch (error) {
      const handledError = handleFirebaseError(error, {
        operation: "subscribe-to-query-setup",
        path: collectionPath,
      })

      if (onError) {
        onError(handledError)
      } else {
        console.error("Error setting up query subscription:", handledError)
      }

      // Return a no-op unsubscribe function
      return () => {}
    }
  },

  // Helper functions
  helpers: {
    /**
     * Create a document reference
     */
    docRef(collectionPath: string, docId: string): DocumentReference {
      return doc(db, collectionPath, docId)
    },

    /**
     * Create a where constraint
     */
    where(field: string, opStr: string, value: any): QueryConstraint {
      return where(field, opStr as any, value)
    },

    /**
     * Create an orderBy constraint
     */
    orderBy(field: string, direction: "asc" | "desc" = "asc"): QueryConstraint {
      return orderBy(field, direction)
    },

    /**
     * Create a limit constraint
     */
    limit(limitCount: number): QueryConstraint {
      return limit(limitCount)
    },

    /**
     * Create a startAfter constraint
     */
    startAfter(doc: DocumentData): QueryConstraint {
      return startAfter(doc)
    },

    /**
     * Create an increment value
     */
    increment(value: number) {
      return increment(value)
    },

    /**
     * Create an arrayUnion value
     */
    arrayUnion(...elements: any[]) {
      return arrayUnion(...elements)
    },

    /**
     * Create an arrayRemove value
     */
    arrayRemove(...elements: any[]) {
      return arrayRemove(...elements)
    },

    /**
     * Create a serverTimestamp value
     */
    serverTimestamp() {
      return serverTimestamp()
    },
  },
}
