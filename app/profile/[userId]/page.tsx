"use client"

import { useParams } from "next/navigation"
import { ProfileView } from "@/components/profile-view"

export default function PublicProfilePage() {
  const params = useParams()
  const userId = params.userId as string

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">User Profile</h1>
      <ProfileView userId={userId} />
    </div>
  )
}
