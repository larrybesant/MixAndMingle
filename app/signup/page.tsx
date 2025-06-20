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

  const handleSignUp = async () => {
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
        data: { username },
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
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-2"
        />
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-2"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-2"
        />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <Button
          onClick={handleSignUp}
          disabled={loading || !username || !email || !password}
          className="w-full mb-2"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </Button>
        <Button
          onClick={() => handleOAuth("google")}
          className="w-full mb-2"
        >
          Sign Up with Google
        </Button>
      </div>
    </div>
  )
}
