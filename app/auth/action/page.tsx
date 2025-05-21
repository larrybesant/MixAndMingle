"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function AuthActionHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get the mode and oobCode from the URL
    const mode = searchParams.get("mode")
    const oobCode = searchParams.get("oobCode")

    console.log("Auth action handler:", { mode, oobCode })

    if (mode === "resetPassword" && oobCode) {
      // Redirect to our reset password page with the oobCode
      router.push(`/reset-password?oobCode=${oobCode}`)
    } else {
      // Redirect to login for any other case
      router.push("/login")
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-black flex items-center justify-center">
      <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-indigo-900/50 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-white mb-4">Processing...</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
        <p className="text-center mt-4 text-gray-400">Please wait while we redirect you...</p>
      </div>
    </div>
  )
}
