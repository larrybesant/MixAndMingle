"use client"

import { useEffect } from "react"
import { initializeAnalytics } from "@/lib/firebase/firebase-client"
import { usePathname, useSearchParams } from "next/navigation"

export function FirebaseAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Initialize analytics
    const analytics = initializeAnalytics()

    // Log page view when route changes
    if (analytics) {
      const { logEvent } = require("firebase/analytics")
      logEvent(analytics, "page_view", {
        page_path: pathname,
        page_location: window.location.href,
        page_title: document.title,
      })
    }
  }, [pathname, searchParams])

  return null // This component doesn't render anything
}
