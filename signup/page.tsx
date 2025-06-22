"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SignupPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Helper to sanitize input (remove HTML tags, trim, limit length)
  function sanitizeInput(input: string, maxLength: number = 100): string {
    return input.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim().slice(0, maxLength)
  }

  // Helper to validate username (alphanumeric, underscores, 3-20 chars)
  function isValidUsername(name: string): boolean {
    return /^[a-zA-Z0-9_]{3,20}$/.test(name)
  }

  // Helper to validate email
  function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Helper to validate password (min 8 chars)
  function isValidPassword(pw: string): boolean {
    return pw.length >= 8
  }

  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true)
    setError("")
    // Sanitize and validate inputs
    const cleanUsername = sanitizeInput(username, 20)
    const cleanEmail = sanitizeInput(email, 100)
    const cleanPassword = password.trim()
    if (!cleanUsername || !cleanEmail || !cleanPassword) {
      setError("All fields are required.")
      setLoading(false)
      return
    }
    if (!isValidUsername(cleanUsername)) {
      setError(
        "Username must be 3-20 characters, letters, numbers, or underscores only."
      )
      setLoading(false)
      return
    }
    if (!isValidEmail(cleanEmail)) {
      setError("Please enter a valid email address.")
      setLoading(false)
      return
    }
    if (!isValidPassword(cleanPassword)) {
      setError("Password must be at least 8 characters.")
      setLoading(false)
      return
    }
    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
        data: { username: cleanUsername },
      },
    })
    if (error) {
      setError(error.message)
    } else {
      router.push("/signup/check-email")
    }
    setLoading(false)
  }

  const handleOAuth = async (provider: "google") => {
    setError("")
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) setError(`OAuth signup failed: ${error.message}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black px-4">
      <div className="w-full max-w-md bg-black/80 border border-purple-500/30 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent mb-4">
          Mix & Mingle Signup
        </h1>
        <form onSubmit={handleSignUp}>
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-2"
            autoComplete="username"
          />
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-2"
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-2"
            autoComplete="new-password"
          />
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <Button
            type="submit"
            disabled={loading || !username || !email || !password}
            className="w-full mb-2"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
        <Button
          type="button"
          onClick={() => handleOAuth("google")}
          className="w-full mb-2"
        >
          Sign Up with Google
        </Button>
      </div>
    </div>
  )
}
