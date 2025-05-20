"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProfileView } from "@/components/profile-view"
import { ProfileEditor } from "@/components/profile-editor"
import { useAuthState } from "@/hooks/use-auth-state"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  const { user } = useAuthState()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("view")

  if (!user) {
    return (
      <div className="container py-8">
        <div className="bg-muted p-4 rounded-md">
          <p className="text-muted-foreground">Please sign in to view your profile</p>
        </div>
      </div>
    )
  }

  const handleEditClick = () => {
    setActiveTab("edit")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view">View Profile</TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="view" className="mt-6">
          <ProfileView userId={user.uid} onEditClick={handleEditClick} />
        </TabsContent>
        <TabsContent value="edit" className="mt-6">
          <ProfileEditor />
        </TabsContent>
      </Tabs>
    </div>
  )
}
