"use client"

import { useState, useEffect, useCallback } from "react"
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  type QueryConstraint,
  type DocumentData,
  type QuerySnapshot,
  type DocumentSnapshot,
} from "firebase/firestore"
import { db } from "@/lib/firebase-browser"
import { useOnlineStatus } from "./use-online-status"

interface UseOfflineDataOptions<T> {
  transform?: (data: DocumentData) => T
  onError?: (error: Error) => void
}

interface UseOfflineDataReturn<T> {
  data: T[] | null
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
  isStale: boolean
}

export function useOfflineCollection<T = DocumentData>(
  collectionPath: string,
  constraints: QueryConstraint[] = [],
  options: UseOfflineDataOptions<T> = {},
): UseOfflineDataReturn<T> {
  const [data, setData] = useState<T[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastOnlineUpdate, setLastOnlineUpdate] = useState<Date | null>(null)
  const { isOnline } = useOnlineStatus()

  const transform = options.transform || ((data: DocumentData) => data as T)
  const onError = options.onError || console.error

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const q = query(collection(db, collectionPath), ...constraints)
      const querySnapshot = await getDocs(q)

      const items: T[] = []
      querySnapshot.forEach((doc) => {
        items.push(transform({ id: doc.id, ...doc.data() }))
      })

      setData(items)
      if (isOnline) {
        setLastOnlineUpdate(new Date())
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      onError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [collectionPath, constraints, transform, onError, isOnline])

  useEffect(() => {
    // Initial fetch
    fetchData()

    // Set up real-time listener if online
    if (isOnline) {
      const q = query(collection(db, collectionPath), ...constraints)
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot: QuerySnapshot) => {
          const items: T[] = []
          querySnapshot.forEach((doc) => {
            items.push(transform({ id: doc.id, ...doc.data() }))
          })
          setData(items)
          setLastOnlineUpdate(new Date())
          setLoading(false)
        },
        (err) => {
          setError(err instanceof Error ? err : new Error(String(err)))
          onError(err instanceof Error ? err : new Error(String(err)))
          setLoading(false)
        },
      )

      return () => unsubscribe()
    }

    return undefined
  }, [collectionPath, constraints, transform, onError, isOnline, fetchData])

  // Calculate if data is stale (we're offline and data was last updated more than 1 hour ago)
  const isStale = !isOnline && lastOnlineUpdate ? new Date().getTime() - lastOnlineUpdate.getTime() > 3600000 : false

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    isStale,
  }
}

interface UseOfflineDocumentReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
  isStale: boolean
}

export function useOfflineDocument<T = DocumentData>(
  documentPath: string,
  options: UseOfflineDataOptions<T> = {},
): UseOfflineDocumentReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastOnlineUpdate, setLastOnlineUpdate] = useState<Date | null>(null)
  const { isOnline } = useOnlineStatus()

  const transform = options.transform || ((data: DocumentData) => data as T)
  const onError = options.onError || console.error

  const fetchData = useCallback(async () => {
    if (!documentPath) {
      setData(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const docRef = doc(db, documentPath)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        setData(transform({ id: docSnap.id, ...docSnap.data() }))
      } else {
        setData(null)
      }

      if (isOnline) {
        setLastOnlineUpdate(new Date())
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      onError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [documentPath, transform, onError, isOnline])

  useEffect(() => {
    // Initial fetch
    fetchData()

    // Set up real-time listener if online and document path exists
    if (isOnline && documentPath) {
      const docRef = doc(db, documentPath)
      const unsubscribe = onSnapshot(
        docRef,
        (docSnapshot: DocumentSnapshot) => {
          if (docSnapshot.exists()) {
            setData(transform({ id: docSnapshot.id, ...docSnapshot.data() }))
          } else {
            setData(null)
          }
          setLastOnlineUpdate(new Date())
          setLoading(false)
        },
        (err) => {
          setError(err instanceof Error ? err : new Error(String(err)))
          onError(err instanceof Error ? err : new Error(String(err)))
          setLoading(false)
        },
      )

      return () => unsubscribe()
    }

    return undefined
  }, [documentPath, transform, onError, isOnline, fetchData])

  // Calculate if data is stale (we're offline and data was last updated more than 1 hour ago)
  const isStale = !isOnline && lastOnlineUpdate ? new Date().getTime() - lastOnlineUpdate.getTime() > 3600000 : false

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    isStale,
  }
}
