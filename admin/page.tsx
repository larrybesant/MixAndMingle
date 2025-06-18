"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import supabase from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("larrybesant@gmail.com")
  const [password, setPassword] = useState("")
  const [adminKey, setAdminKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    // Check admin key first
    if (adminKey !== "MIXMINGLE2024ADMIN") {
      setMessage("Invalid admin key")
      setLoading(false)
      return
    }

    try {
      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        // If sign in fails, try to create the account
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: "larry_admin",
              full_name: "Larry Besant",
              role: "admin",
            },
          },
        })

        if (signUpError) {
          setMessage(signUpError.message)
          setLoading(false)
          return
        }

        // If signup successful, create profile
        if (signUpData.user) {
          await supabase.from("profiles").upsert({
            id: signUpData.user.id,
            username: "larry_admin",
            full_name: "Larry Besant",
            bio: "Mix & Mingle Platform Administrator",
          })
        }

        setMessage("✅ Admin account created! Please check your email to verify, then try logging in again.")
        setLoading(false)
        return
      }

      // If sign in successful, redirect to dashboard
      router.push("/admin/dashboard")
    } catch (err: any) {
      setMessage(err.message || "Something went wrong")
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back to main site */}
        <div className="mb-6">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Mix & Mingle
          </Link>
        </div>

        {/* Admin Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
          <p className="text-gray-300">Mix & Mingle Administrative Access</p>
        </div>

        {/* Admin Login Form */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-red-500/20 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center text-red-400">Secure Admin Login</h2>

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-white mb-2 block font-medium">
                Admin Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@mixandmingle.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-red-500/30 text-white placeholder-white/40 focus:border-red-400 focus:ring-red-400 rounded-xl h-12"
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-red-500/30 text-white placeholder-white/40 focus:border-red-400 focus:ring-red-400 rounded-xl h-12"
                required
              />
            </div>

            <div>
              <Label htmlFor="adminKey" className="text-white mb-2 block font-medium">
                Admin Key
              </Label>
              <Input
                id="adminKey"
                type="password"
                placeholder="Enter admin key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="bg-white/5 border-red-500/30 text-white placeholder-white/40 focus:border-red-400 focus:ring-red-400 rounded-xl h-12"
                required
              />
              <p className="text-gray-500 text-xs mt-1">Admin key: MIXMINGLE2024ADMIN</p>
            </div>

            {message && (
              <div
                className={`text-sm text-center p-4 rounded-xl border ${
                  message.includes("✅")
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
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 rounded-xl font-semibold text-lg h-12"
            >
              {loading ? "Authenticating..." : "Admin Login"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">Secure administrative access with dual authentication</p>
          </div>
        </div>
      </div>
    </main>
  )
}
