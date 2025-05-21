"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { userService, type UserProfile } from "@/lib/user-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

export function SimpleProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return

      try {
        setLoading(true)
        const userProfile = await userService.getUserProfile(user.uid)
        setProfile(userProfile)

        if (userProfile) {
          setDisplayName(userProfile.displayName || "")
          setBio(userProfile.bio || "")
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const handleSave = async () => {
    if (!user) return

    try {
      setSaving(true)
      await userService.updateUserProfile(user.uid, {
        displayName,
        bio,
      })

      setProfile((prev) => (prev ? { ...prev, displayName, bio } : null))
      setEditing(false)
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-6 w-1/3" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Unable to load your profile. Please try again later.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.photoURL || ""} alt={profile.displayName} />
            <AvatarFallback>{profile.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          {editing ? (
            <div className="space-y-2 flex-1">
              <Label htmlFor="displayName">Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          ) : (
            <div>
              <h3 className="font-medium">{profile.displayName}</h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          )}
        </div>

        {editing ? (
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows={3}
            />
          </div>
        ) : (
          <div>
            <h4 className="text-sm font-medium mb-1">Bio</h4>
            <p className="text-sm">{profile.bio || "No bio provided yet."}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {editing ? (
          <div className="flex space-x-2 w-full">
            <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        ) : (
          <Button onClick={() => setEditing(true)} variant="outline" className="w-full">
            Edit Profile
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
