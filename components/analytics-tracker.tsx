"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { getAnalytics, logEvent } from "firebase/analytics"
import { initializeFirebaseClient } from "@/lib/firebase/firebase-client"

export function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Track page views
    const app = initializeFirebaseClient()
    const analytics = getAnalytics(app)

    logEvent(analytics, "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [pathname, searchParams])

  return null
}
