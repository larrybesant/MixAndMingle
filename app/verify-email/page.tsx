"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token")
      const type = searchParams.get("type")

      if (type === "signup" && token) {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "signup",
          })

          if (error) {
            setStatus("error")
            setMessage(error.message)
          } else {
            setStatus("success")
            setMessage("Email verified successfully! You can now sign in.")
            setTimeout(() => {
              router.push("/login")
            }, 3000)
          }
        } catch (err) {
          setStatus("error")
          setMessage("An unexpected error occurred")
        }
      } else {
        setStatus("error")
        setMessage("Invalid verification link")
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="max-w-md w-full text-center space-y-6 bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Email Verification</h1>

          {status === "loading" && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
              <p className="text-gray-400">Verifying your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="text-6xl">✅</div>
              <p className="text-green-400">{message}</p>
              <p className="text-gray-400">Redirecting to login...</p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="text-6xl">❌</div>
              <p className="text-red-400">{message}</p>
              <Link
                href="/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300"
              >
                Go to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="max-w-md w-full text-center space-y-6 bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
        <p className="text-gray-400">Loading verification...</p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
