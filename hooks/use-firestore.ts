"use client"

import { useState, useCallback } from "react"
import { firestoreWrapper, type FirestoreData, type QueryOptions } from "@/lib/firestore-wrapper"
import { useFirebaseError } from "./use-firebase-error"
import type { QueryConstraint } from "firebase/firestore"

export function useFirestore<T extends FirestoreData = FirestoreData>(collectionPath: string) {
  const [loading, setLoading] = useState(false)
  const { error, handleError, clearError } = useFirebaseError()

  // Get a document by ID
  const getDocument = useCallback(
    async (docId: string) => {
      setLoading(true)
      clearError()

      try {
        return await firestoreWrapper.getDocument<T>(collectionPath, docId)
      } catch (err) {
        handleError(err, { operation: "get-document", path: `${collectionPath}/${docId}` })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [collectionPath, handleError, clearError],
  )

  // Create or update a document
  const setDocument = useCallback(
    async (docId: string, data: T, merge = true) => {
      setLoading(true)
      clearError()

      try {
        await firestoreWrapper.setDocument<T>(collectionPath, docId, data, { merge })
      } catch (err) {
        handleError(err, { operation: "set-document", path: `${collectionPath}/${docId}` })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [collectionPath, handleError, clearError],
  )

  // Update a document
  const updateDocument = useCallback(
    async (docId: string, data: Partial<T>) => {
      setLoading(true)
      clearError()

      try {
        await firestoreWrapper.updateDocument<Partial<T>>(collectionPath, docId, data)
      } catch (err) {
        handleError(err, { operation: "update-document", path: `${collectionPath}/${docId}` })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [collectionPath, handleError, clearError],
  )

  // Delete a document
  const deleteDocument = useCallback(
    async (docId: string) => {
      setLoading(true)
      clearError()

      try {
        await firestoreWrapper.deleteDocument(collectionPath, docId)
      } catch (err) {
        handleError(err, { operation: "delete-document", path: `${collectionPath}/${docId}` })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [collectionPath, handleError, clearError],
  )

  // Query documents
  const queryDocuments = useCallback(
    async (constraints: QueryConstraint[] = [], options: QueryOptions = {}) => {
      setLoading(true)
      clearError()

      try {
        return await firestoreWrapper.queryDocuments<T>(collectionPath, constraints, options)
      } catch (err) {
        handleError(err, { operation: "query-documents", path: collectionPath })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [collectionPath, handleError, clearError],
  )

  // Subscribe to a document
  const subscribeToDocument = useCallback(
    (docId: string, callback: (data: T | null) => void) => {
      try {
        return firestoreWrapper.subscribeToDocument<T>(collectionPath, docId, callback, {
          onError: (err) =>
            handleError(err, {
              operation: "subscribe-to-document",
              path: `${collectionPath}/${docId}`,
            }),
        })
      } catch (err) {
        handleError(err, { operation: "subscribe-to-document-setup", path: `${collectionPath}/${docId}` })
        // Return a no-op unsubscribe function
        return () => {}
      }
    },
    [collectionPath, handleError],
  )

  // Subscribe to a query
  const subscribeToQuery = useCallback(
    (constraints: QueryConstraint[] = [], callback: (data: T[]) => void) => {
      try {
        return firestoreWrapper.subscribeToQuery<T>(collectionPath, constraints, callback, {
          onError: (err) =>
            handleError(err, {
              operation: "subscribe-to-query",
              path: collectionPath,
            }),
        })
      } catch (err) {
        handleError(err, { operation: "subscribe-to-query-setup", path: collectionPath })
        // Return a no-op unsubscribe function
        return () => {}
      }
    },
    [collectionPath, handleError],
  )

  return {
    loading,
    error,
    getDocument,
    setDocument,
    updateDocument,
    deleteDocument,
    queryDocuments,
    subscribeToDocument,
    subscribeToQuery,
    // Helper functions
    where: firestoreWrapper.helpers.where,
    orderBy: firestoreWrapper.helpers.orderBy,
    limit: firestoreWrapper.helpers.limit,
    startAfter: firestoreWrapper.helpers.startAfter,
    increment: firestoreWrapper.helpers.increment,
    arrayUnion: firestoreWrapper.helpers.arrayUnion,
    arrayRemove: firestoreWrapper.helpers.arrayRemove,
    serverTimestamp: firestoreWrapper.helpers.serverTimestamp,
  }
}
