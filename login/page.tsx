"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to demo login page
    router.replace("/demo-login")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="text-white text-xl">Redirecting to demo login...</div>
    </div>
  )
}
