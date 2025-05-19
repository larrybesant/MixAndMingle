"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertTriangle } from "lucide-react"

export default function RouteChecker() {
  const pathname = usePathname()
  const [routeStatus, setRouteStatus] = useState<{
    status: "checking" | "success" | "error"
    message?: string
  }>({
    status: "checking",
  })

  useEffect(() => {
    // Check if the current route exists
    const checkRoute = async () => {
      try {
        const response = await fetch(pathname)
        if (response.ok) {
          setRouteStatus({
            status: "success",
            message: `Route ${pathname} is working correctly`,
          })
        } else {
          setRouteStatus({
            status: "error",
            message: `Route ${pathname} returned status ${response.status}`,
          })
        }
      } catch (error) {
        setRouteStatus({
          status: "error",
          message: `Error checking route: ${error}`,
        })
      }
    }

    checkRoute()
  }, [pathname])

  if (routeStatus.status === "checking") {
    return null
  }

  if (routeStatus.status === "success") {
    return (
      <Alert className="fixed bottom-4 right-4 w-auto max-w-md border-green-600 bg-green-950/50 backdrop-blur">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <AlertTitle className="text-green-500">Route Working</AlertTitle>
        <AlertDescription className="text-green-400">{routeStatus.message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="fixed bottom-4 right-4 w-auto max-w-md border-red-600 bg-red-950/50 backdrop-blur">
      <AlertTriangle className="h-4 w-4 text-red-500" />
      <AlertTitle className="text-red-500">Route Error</AlertTitle>
      <AlertDescription className="text-red-400">{routeStatus.message}</AlertDescription>
    </Alert>
  )
}
