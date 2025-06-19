"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SignupPage() {
  const [djName, setDjName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async () => {
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
        data: { dj_name: djName },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      alert("🎵 Check your email for a verification link before signing in!")
    }
    setLoading(false)
  }

  const handleOAuth = async (provider: "google" | "facebook") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) {
      setError(`OAuth signup failed: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="w-full max-w-xs sm:max-w-md bg-black/80 border border-purple-500/30 backdrop-blur-sm rounded-lg">
        <div className="text-center p-6 pb-0">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
            Mix 🎵 Mingle
          </h1>
          <p className="text-gray-400 text-sm">Join the ultimate DJ community</p>
        </div>
        <div className="space-y-4 p-6">
          <Input
            type="text"
            placeholder="Username (e.g. musicfan123)"
            value={djName}
            onChange={(e) => setDjName(e.target.value)}
            className="bg-gray-900/50 border-purple-500/30 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400 rounded-xl h-12"
          />

          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-900/50 border-purple-500/30 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400 rounded-xl h-12"
          />

          <Input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-900/50 border-purple-500/30 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400 rounded-xl h-12"
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Button
            onClick={handleSignUp}
            disabled={loading || !djName || !email || !password}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl h-12 transition-all duration-200 transform hover:scale-105"
          >
            {loading ? "Creating Account..." : "🎧 Join Mix & Mingle"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuth("google")}
              className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-100 border-gray-300 rounded-xl h-12"
            >
              <Image src="/icons/google.svg" alt="Google" width={20} height={20} />
              Continue with Google
            </Button>

            <Button
              type="button"
              onClick={() => handleOAuth("facebook")}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl h-12"
            >
              <Image src="/icons/facebook.svg" alt="Facebook" width={20} height={20} />
              Continue with Facebook
            </Button>
          </div>

          <div className="text-center pt-4">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-blue-400 hover:text-blue-300 hover:underline font-medium">
                Sign In
              </a>
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By signing up, you agree to our{" "}
              <a href="/terms" className="text-purple-400 hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-purple-400 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
