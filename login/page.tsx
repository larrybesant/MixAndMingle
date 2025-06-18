"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import supabase from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setMessage(error.message)
      } else {
        router.push("/dashboard")
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
          <p className="text-gray-300 mt-2">Welcome back to the beat</p>
        </div>

        {/* Login Form */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

          <form onSubmit={handleLogin} className="space-y-6">
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
                className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-blue-400 focus:ring-blue-400 rounded-xl h-12"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white mb-2 block font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-blue-400 focus:ring-blue-400 rounded-xl h-12"
                required
              />
            </div>

            {message && (
              <div className="text-red-400 text-sm text-center bg-red-400/10 p-4 rounded-xl border border-red-400/20">
                {message}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 h-12"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Don't have an account? Sign Up
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
