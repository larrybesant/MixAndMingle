"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function UserProfilePage() {
  const params = useParams()
  const id = params.id as string
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("username, bio, music_preferences, relationship_style, bdsm_preferences, show_bdsm_public, avatar_url")
        .eq("id", id)
        .single()
      setProfile(data)
      setLoading(false)
    }
    if (id) fetchProfile()
  }, [id])

  if (loading) return <div className="text-white p-8">Loading...</div>
  if (!profile) return <div className="text-red-500 p-8">Profile not found.</div>

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-2">
      <div className="bg-gray-900 rounded-2xl p-8 shadow-lg w-full max-w-md flex flex-col items-center">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={profile.avatar_url} alt={profile.username} />
          <AvatarFallback>{profile.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <h2 className="text-3xl font-bold mb-2">{profile.username}</h2>
        <div className="text-gray-400 mb-2">{profile.relationship_style ? profile.relationship_style.charAt(0).toUpperCase() + profile.relationship_style.slice(1) : "Not set"}</div>
        <div className="mb-4 text-center">{profile.bio}</div>
        <div className="mb-4 text-center text-sm text-gray-300">
          <span className="font-semibold">Music Preferences:</span> {Array.isArray(profile.music_preferences) ? profile.music_preferences.join(", ") : profile.music_preferences}
        </div>
        {profile.show_bdsm_public && profile.bdsm_preferences && (
          <div className="mb-4 text-center text-sm bg-gray-800/80 p-3 rounded-lg">
            <span className="font-semibold text-purple-300">BDSM / Kink / Other:</span> {profile.bdsm_preferences}
          </div>
        )}
        <Link
          href="https://mixandmingle.daily.co/onFsceKakRamUvWONG5y"
          target="_blank"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition block text-center mt-4"
        >
          Join Live Room
        </Link>
      </div>
    </main>
  )
}
