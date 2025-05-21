"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function AuthActionHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get the mode and oobCode from the URL
    const mode = searchParams.get("mode")
    const oobCode = searchParams.get("oobCode")
    const continueUrl = searchParams.get("continueUrl")

    console.log("Auth action handler:", { mode, oobCode, continueUrl })

    if (mode === "resetPassword" && oobCode) {
      // Redirect to our reset password page with the oobCode
      router.push(`/reset-password?oobCode=${oobCode}`)
    } else if (mode === "verifyEmail" && oobCode) {
      // Handle email verification if implemented
      router.push(`/email-verified?oobCode=${oobCode}`)
    } else if (continueUrl) {
      // If there's a continue URL, redirect there
      try {
        // Make sure it's a URL for our domain to prevent open redirects
        const url = new URL(continueUrl)
        if (url.origin === window.location.origin) {
          router.push(url.pathname + url.search + url.hash)
          return
        }
      } catch (e) {
        console.error("Invalid continue URL:", continueUrl)
      }
      router.push("/login")
    } else {
      // Fallback to login for any other case
      setError("Invalid or missing authentication parameters")
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-black flex items-center justify-center">
      <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-indigo-900/50 max-w-md w-full">
        {error ? (
          <>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <p className="text-center text-gray-400">Redirecting to login page...</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center text-white mb-4">Processing...</h1>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
            <p className="text-center mt-4 text-gray-400">Please wait while we redirect you...</p>
          </>
        )}
      </div>
    </div>
  )
}
