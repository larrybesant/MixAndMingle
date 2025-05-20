"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useAnalytics } from "@/hooks/use-analytics"

export function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { trackPageView } = useAnalytics()

  useEffect(() => {
    if (!pathname) return

    // Construct the full URL path including search params
    let path = pathname
    const params = searchParams?.toString()
    if (params) {
      path += `?${params}`
    }

    // Track the page view
    trackPageView(path, document.title)
  }, [pathname, searchParams, trackPageView])

  return null
}
