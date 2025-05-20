"use client"

import { useState, useEffect } from "react"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { db } from "@/lib/firebase-browser"
import { collection, addDoc, doc, writeBatch, serverTimestamp } from "firebase/firestore"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

// Define operation types
type OperationType = "add" | "update" | "delete"

interface QueuedOperation {
  id: string
  type: OperationType
  collectionPath: string
  docId?: string
  data?: any
  timestamp: number
  retries: number
}

const STORAGE_KEY = "mix_and_mingle_offline_operations"
const MAX_RETRIES = 3

export function OfflineOperationsQueue() {
  const [queue, setQueue] = useState<QueuedOperation[]>([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { isOnline } = useOnlineStatus()

  // Load queue from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedQueue = localStorage.getItem(STORAGE_KEY)
      if (savedQueue) {
        try {
          setQueue(JSON.parse(savedQueue))
        } catch (e) {
          console.error("Error parsing offline operations queue:", e)
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    }
  }, [])

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && queue.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
    }
  }, [queue])

  // Process queue when we come back online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !processing) {
      processQueue()
    }
  }, [isOnline, queue, processing])

  // Add operation to queue
  const addToQueue = (type: OperationType, collectionPath: string, data?: any, docId?: string) => {
    const newOperation: QueuedOperation = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      collectionPath,
      docId,
      data,
      timestamp: Date.now(),
      retries: 0,
    }

    setQueue((prevQueue) => [...prevQueue, newOperation])
    return newOperation.id
  }

  // Process the queue
  const processQueue = async () => {
    if (!isOnline || queue.length === 0 || processing) return

    setProcessing(true)
    setProgress(0)
    setError(null)
    setSuccess(null)

    const batch = writeBatch(db)
    const successfulOps: string[] = []
    const failedOps: QueuedOperation[] = []
    let totalProcessed = 0

    try {
      for (const operation of queue) {
        try {
          switch (operation.type) {
            case "add":
              if (operation.collectionPath && operation.data) {
                // For add operations, we need to use addDoc directly
                await addDoc(collection(db, operation.collectionPath), {
                  ...operation.data,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                  syncedFromOffline: true,
                })
              }
              break

            case "update":
              if (operation.collectionPath && operation.docId && operation.data) {
                const docRef = doc(db, operation.collectionPath, operation.docId)
                batch.update(docRef, {
                  ...operation.data,
                  updatedAt: serverTimestamp(),
                  syncedFromOffline: true,
                })
              }
              break

            case "delete":
              if (operation.collectionPath && operation.docId) {
                const docRef = doc(db, operation.collectionPath, operation.docId)
                batch.delete(docRef)
              }
              break
          }

          successfulOps.push(operation.id)
        } catch (err) {
          console.error(`Error processing operation ${operation.id}:`, err)

          // Increment retry count for failed operations
          if (operation.retries < MAX_RETRIES) {
            failedOps.push({
              ...operation,
              retries: operation.retries + 1,
            })
          }
        }

        totalProcessed++
        setProgress(Math.round((totalProcessed / queue.length) * 100))
      }

      // Commit the batch
      await batch.commit()

      // Update the queue with only the failed operations
      setQueue(failedOps)

      if (failedOps.length === 0) {
        setSuccess(`Successfully processed ${successfulOps.length} offline operations`)
        // Clear localStorage if queue is empty
        localStorage.removeItem(STORAGE_KEY)
      } else {
        setError(`${failedOps.length} operations failed and will be retried when online`)
      }
    } catch (err) {
      console.error("Error processing offline operations queue:", err)
      setError("Error processing offline operations. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  // Expose methods to the window for other components to use
  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore
      window.offlineQueue = {
        add: (collectionPath: string, data: any) => addToQueue("add", collectionPath, data),
        update: (collectionPath: string, docId: string, data: any) => addToQueue("update", collectionPath, data, docId),
        delete: (collectionPath: string, docId: string) => addToQueue("delete", collectionPath, undefined, docId),
        getQueue: () => queue,
        processNow: processQueue,
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        // @ts-ignore
        delete window.offlineQueue
      }
    }
  }, [queue])

  if (queue.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 w-80 z-50">
      {processing ? (
        <Alert className="bg-white border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertTitle>Syncing offline changes</AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {progress}% complete ({queue.length} operations)
              </p>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-white border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertTitle>Offline changes pending</AlertTitle>
          <AlertDescription>
            <p className="text-sm mb-2">
              You have {queue.length} operation{queue.length !== 1 ? "s" : ""} waiting to be synced.
            </p>
            {isOnline ? (
              <Button size="sm" variant="outline" className="w-full" onClick={processQueue}>
                Sync now
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">Changes will sync automatically when you're back online.</p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="bg-white border-red-200 mt-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-white border-green-200 mt-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
