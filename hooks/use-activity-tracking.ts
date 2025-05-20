"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { activityTrackingService } from "@/lib/activity-tracking-service"

export function useActivityTracking() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Track page views
  useEffect(() => {
    if (user) {
      activityTrackingService.logActivity(user.uid, "page_view", { path: pathname })
    }
  }, [pathname, user])

  // Track session start
  useEffect(() => {
    if (user) {
      activityTrackingService.logActivity(user.uid, "session_start")

      // Clean up old logs when session starts
      activityTrackingService.cleanupOldLogs(user.uid)

      // Track session end
      return () => {
        activityTrackingService.logActivity(user.uid, "session_end")
      }
    }
  }, [user])

  // Track user activity (mouse/keyboard)
  useEffect(() => {
    if (!user) return

    let activityTimeout: NodeJS.Timeout | null = null
    let lastActivityLog = Date.now()
    const ACTIVITY_THROTTLE = 5 * 60 * 1000 // 5 minutes

    const handleActivity = () => {
      const now = Date.now()
      if (now - lastActivityLog > ACTIVITY_THROTTLE) {
        activityTrackingService.logActivity(user.uid, "user_active")
        lastActivityLog = now
      }

      // Reset inactivity timer
      if (activityTimeout) {
        clearTimeout(activityTimeout)
      }

      // Set timer to log inactivity after 10 minutes
      activityTimeout = setTimeout(
        () => {
          activityTrackingService.logActivity(user.uid, "user_inactive")
        },
        10 * 60 * 1000,
      )
    }

    // Track various user activities
    window.addEventListener("mousemove", handleActivity)
    window.addEventListener("keydown", handleActivity)
    window.addEventListener("click", handleActivity)
    window.addEventListener("scroll", handleActivity)
    window.addEventListener("touchstart", handleActivity)

    // Initial activity log
    handleActivity()

    return () => {
      if (activityTimeout) {
        clearTimeout(activityTimeout)
      }
      window.removeEventListener("mousemove", handleActivity)
      window.removeEventListener("keydown", handleActivity)
      window.removeEventListener("click", handleActivity)
      window.removeEventListener("scroll", handleActivity)
      window.removeEventListener("touchstart", handleActivity)
    }
  }, [user])

  // Function to log specific activities
  const logActivity = (action: string, metadata?: Record<string, any>) => {
    if (user) {
      activityTrackingService.logActivity(user.uid, action, metadata)
    }
  }

  return { logActivity }
}
