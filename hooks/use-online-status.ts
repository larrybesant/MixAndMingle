"use client"

import { useState, useEffect } from "react"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-client-safe"
import { useAuth } from "@/lib/auth-context"

export function useOnlineStatus() {
  const { user } = useAuth()
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)

  useEffect(() => {
    // Update online status when the page is loaded
    if (user) {
      updateOnlineStatus(true)
    }

    // Update online status when the window gains focus
    const handleFocus = () => {
      if (user) {
        updateOnlineStatus(true)
      }
    }

    // Update online status when the window loses focus
    const handleBlur = () => {
      if (user) {
        updateOnlineStatus(false)
      }
    }

    // Update online status when the user goes online
    const handleOnline = () => {
      setIsOnline(true)
      if (user) {
        updateOnlineStatus(true)
      }
    }

    // Update online status when the user goes offline
    const handleOffline = () => {
      setIsOnline(false)
      if (user) {
        updateOnlineStatus(false)
      }
    }

    // Set up event listeners
    window.addEventListener("focus", handleFocus)
    window.addEventListener("blur", handleBlur)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Set up beforeunload event to update status when the user leaves
    window.addEventListener("beforeunload", () => {
      if (user) {
        updateOnlineStatus(false, true)
      }
    })

    // Clean up event listeners
    return () => {
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("blur", handleBlur)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)

      // Update online status when the component unmounts
      if (user) {
        updateOnlineStatus(false)
      }
    }
  }, [user])

  // Function to update online status in Firestore
  const updateOnlineStatus = async (status: boolean, immediate = false) => {
    if (!user) return

    try {
      const userDocRef = doc(db, "users", user.uid)

      if (immediate) {
        // Use a synchronous approach for beforeunload
        const xhr = new XMLHttpRequest()
        xhr.open("POST", "/api/update-online-status", false) // false makes it synchronous
        xhr.setRequestHeader("Content-Type", "application/json")
        xhr.send(JSON.stringify({ userId: user.uid, isOnline: status }))
      } else {
        // Use normal async approach
        await updateDoc(userDocRef, {
          isOnline: status,
          lastSeen: serverTimestamp(),
        })
      }
    } catch (error) {
      console.error("Error updating online status:", error)
    }
  }

  return { isOnline }
}
