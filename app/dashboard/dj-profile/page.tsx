"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DjProfileForm } from "@/components/dj-profile-form"
import { getDjProfileByUserId } from "@/services/dj-service"

export default function DjProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [djProfile, setDjProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDjProfile = async () => {
      if (!user) return

      try {
        setLoading(true)
        const profile = await getDjProfileByUserId(user.uid)
        setDjProfile(profile)
      } catch (error) {
        console.error("Error fetching DJ profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDjProfile()
  }, [user])

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{djProfile ? "Edit DJ Profile" : "Create DJ Profile"}</h1>
      <DjProfileForm existingProfile={djProfile} />
    </div>
  )
}
