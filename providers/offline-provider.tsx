"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { OfflineOperationsQueue } from "@/components/offline-operations-queue"
import { useOnlineStatus } from "@/hooks/use-online-status"

interface OfflineContextType {
  isOfflineEnabled: boolean
  pendingOperationsCount: number
  processPendingOperations: () => Promise<void>
}

const OfflineContext = createContext<OfflineContextType>({
  isOfflineEnabled: false,
  pendingOperationsCount: 0,
  processPendingOperations: async () => {},
})

export const useOfflineContext = () => useContext(OfflineContext)

export function OfflineProvider({ children }: { children: ReactNode }) {
  const { isOnline } = useOnlineStatus()
  const [pendingOperationsCount, setPendingOperationsCount] = useState(0)
  const [isOfflineEnabled, setIsOfflineEnabled] = useState(false)

  // Check if offline queue is available and get pending operations count
  useEffect(() => {
    const checkOfflineQueue = () => {
      if (typeof window !== "undefined" && window.offlineQueue) {
        setIsOfflineEnabled(true)
        const queue = window.offlineQueue.getQueue()
        setPendingOperationsCount(queue ? queue.length : 0)
      } else {
        setIsOfflineEnabled(false)
        setPendingOperationsCount(0)
      }
    }

    // Check initially
    checkOfflineQueue()

    // Set up interval to check periodically
    const interval = setInterval(checkOfflineQueue, 5000)

    return () => clearInterval(interval)
  }, [])

  // Process pending operations
  const processPendingOperations = async () => {
    if (typeof window !== "undefined" && window.offlineQueue && isOnline) {
      await window.offlineQueue.processNow()
      const queue = window.offlineQueue.getQueue()
      setPendingOperationsCount(queue ? queue.length : 0)
    }
  }

  return (
    <OfflineContext.Provider
      value={{
        isOfflineEnabled,
        pendingOperationsCount,
        processPendingOperations,
      }}
    >
      {children}
      <OfflineOperationsQueue />
    </OfflineContext.Provider>
  )
}
