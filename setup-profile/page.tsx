"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import supabase from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, AlertCircle, User } from "lucide-react"

export default function SetupProfilePage() {
  const [screenName, setScreenName] = useState("")
  const [bio, setBio] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [checkingName, setCheckingName] = useState(false)
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.replace("/login")
        return
      }
      setUser(data.user)
    }
    getUser()
  }, [router])

  // Check screen name availability as user types
  useEffect(() => {
    const checkNameAvailability = async () => {
      if (!screenName.trim() || screenName.length < 3) {
        setNameAvailable(null)
        return
      }

      setCheckingName(true)
      try {
        const { data } = await supabase.from("profiles").select("username").eq("username", screenName.trim()).single()

        setNameAvailable(!data) // Available if no data found
      } catch (err) {
        setNameAvailable(true) // Available if error (likely means not found)
      }
      setCheckingName(false)
    }

    const debounceTimer = setTimeout(checkNameAvailability, 500)
    return () => clearTimeout(debounceTimer)
  }, [screenName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!screenName.trim()) {
      setError("Screen name is required")
      return
    }

    if (screenName.length < 3) {
      setError("Screen name must be at least 3 characters")
      return
    }

    if (nameAvailable === false) {
      setError("This screen name is already taken")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Create or update profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        username: screenName.trim(),
        full_name: screenName.trim(), // Use screen name as display name
        bio: bio.trim() || null,
      })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      // Redirect to dashboard
      router.replace("/dashboard")
    } catch (err: any) {
      setError(err.message || "Something went wrong")
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#18122B] to-[#1F1D36] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Choose Your Screen Name</h1>
          <p className="text-white/70">This is how others will see you in the community</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="screenName" className="text-white mb-2 block font-medium">
                Screen Name *
              </Label>
              <div className="relative">
                <Input
                  id="screenName"
                  type="text"
                  placeholder="e.g., DJ_Awesome, MusicLover, BeatMaster"
                  value={screenName}
                  onChange={(e) => setScreenName(e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder-white/50 focus:border-purple-400 focus:ring-purple-400 pr-10"
                  required
                  minLength={3}
                  maxLength={20}
                />
                {checkingName && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                  </div>
                )}
                {!checkingName && nameAvailable === true && screenName.length >= 3 && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-400" />
                )}
                {!checkingName && nameAvailable === false && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="mt-2 text-xs">
                {screenName.length >= 3 && !checkingName && (
                  <p className={nameAvailable ? "text-green-400" : "text-red-400"}>
                    {nameAvailable ? "✅ Available!" : "❌ Already taken"}
                  </p>
                )}
                <p className="text-white/40 mt-1">3-20 characters. This will be your public display name.</p>
              </div>
            </div>

            <div>
              <Label htmlFor="bio" className="text-white mb-2 block font-medium">
                Bio (Optional)
              </Label>
              <Input
                id="bio"
                type="text"
                placeholder="Tell the community about your music style..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="bg-white/10 border-white/30 text-white placeholder-white/50 focus:border-purple-400 focus:ring-purple-400"
                maxLength={100}
              />
              <p className="text-white/40 text-xs mt-1">Optional. Share what kind of music you love or create.</p>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || nameAvailable === false || screenName.length < 3}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Setting up your profile..." : "Complete Setup"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">You can change your screen name later in your profile settings</p>
          </div>
        </div>
      </div>
    </main>
  )
}
