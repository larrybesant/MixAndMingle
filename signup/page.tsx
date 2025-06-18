"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import supabase from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/setup-profile`,
        },
      })

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      if (data.user && !data.session) {
        setMessage("✅ Account created! Check your email to verify, then you'll set up your screen name.")
      } else if (data.session) {
        router.push("/setup-profile")
      }
    } catch (err: any) {
      setMessage(err.message || "Something went wrong")
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="text-4xl font-bold text-orange-500">MIX</span>
            <span className="text-4xl font-bold text-orange-500">🎵</span>
            <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              MINGLE
            </span>
          </Link>
          <p className="text-gray-300 mt-2">Join the music community</p>
        </div>

        {/* Signup Form */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          <h2 className="text-2xl font-bold mb-2 text-center">Create Account</h2>
          <p className="text-gray-400 text-sm text-center mb-6">
            You'll choose your screen name after verifying your email
          </p>

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-white mb-2 block font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-purple-400 focus:ring-purple-400 rounded-xl h-12"
                required
              />
              <p className="text-gray-500 text-xs mt-1">We'll send a verification link to this email</p>
            </div>

            <div>
              <Label htmlFor="password" className="text-white mb-2 block font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-purple-400 focus:ring-purple-400 rounded-xl h-12"
                required
                minLength={6}
              />
              <p className="text-gray-500 text-xs mt-1">Minimum 6 characters</p>
            </div>

            {message && (
              <div
                className={`text-sm text-center p-4 rounded-xl border ${
                  message.includes("✅") || message.includes("Check your email")
                    ? "text-green-400 bg-green-400/10 border-green-400/20"
                    : "text-red-400 bg-red-400/10 border-red-400/20"
                }`}
              >
                {message}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 h-12"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm mb-4">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
            <Link href="/login" className="text-orange-400 hover:text-orange-300 transition-colors font-medium">
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
