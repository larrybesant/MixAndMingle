"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase-browser"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, MapPin, Globe, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthState } from "@/hooks/use-auth-state"

interface ProfileViewProps {
  userId: string
  onEditClick?: () => void
}

interface UserProfile {
  displayName?: string
  photoURL?: string
  bio?: string
  location?: string
  website?: string
  interests?: string[]
  createdAt?: any
  [key: string]: any
}

export function ProfileView({ userId, onEditClick }: ProfileViewProps) {
  const { user } = useAuthState()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const isOwnProfile = user?.uid === userId

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const userDoc = await getDoc(doc(db, "users", userId))

        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile)
        } else {
          setError(new Error("User profile not found"))
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch profile"))
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchProfile()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 p-4 rounded-md">
        <p className="text-destructive">Error loading profile: {error.message}</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="bg-muted p-4 rounded-md">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    )
  }

  // Format date
  const formatDate = (timestamp?: any) => {
    if (!timestamp) return "Unknown"

    // Handle Firestore Timestamp objects
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-2">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile.photoURL || ""} alt={profile.displayName || "User"} />
          <AvatarFallback>{profile.displayName?.[0] || "U"}</AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold">{profile.displayName}</h2>

          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
            {profile.location && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin size={14} className="mr-1" />
                <span>{profile.location}</span>
              </div>
            )}

            {profile.website && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Globe size={14} className="mr-1" />
                <a
                  href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}

            {profile.createdAt && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar size={14} className="mr-1" />
                <span>Joined {formatDate(profile.createdAt)}</span>
              </div>
            )}
          </div>

          {isOwnProfile && onEditClick && (
            <Button variant="outline" size="sm" onClick={onEditClick} className="mt-4">
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {profile.bio && (
          <div className="mb-6">
            <p className="whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {profile.interests && profile.interests.length > 0 && (
          <>
            <Separator className="my-4" />
            <div>
              <h3 className="text-sm font-medium mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
