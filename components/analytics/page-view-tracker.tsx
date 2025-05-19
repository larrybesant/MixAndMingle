"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"

export function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  useEffect(() => {
    // Track page view
    const trackPageView = async () => {
      try {
        const supabase = createClient()

        // Create analytics event
        await supabase.from("analytics_events").insert({
          event_type: "page_view",
          page_path: pathname,
          query_params: Object.fromEntries(searchParams.entries()),
          user_id: user?.id || null,
          session_id: getSessionId(),
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString(),
        })
      } catch (error) {
        // Silently fail for analytics
        console.error("Error tracking page view:", error)
      }
    }

    trackPageView()
  }, [pathname, searchParams, user])

  return null
}

// Helper to get or create a session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem("analytics_session_id")

  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem("analytics_session_id", sessionId)
  }

  return sessionId
}

// Generate a random session ID
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
