"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useProfile } from "@/hooks/use-profile"
import { Loader2, MapPin, Calendar, Twitter, Instagram, Facebook, Globe } from "lucide-react"
import Link from "next/link"
import { OnlineStatusIndicator } from "@/components/online-status-indicator"

interface ProfileViewProps {
  userId: string
}

export function ProfileView({ userId }: ProfileViewProps) {
  const { profile, loading, error, isCurrentUser } = useProfile(userId)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 p-4 rounded-md text-destructive">
        <p>Error loading profile: {error.message}</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="bg-muted p-4 rounded-md">
        <p>Profile not found.</p>
      </div>
    )
  }

  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date)
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Card>
      <CardHeader className="relative pb-0">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <OnlineStatusIndicator isOnline={profile.isOnline || false} />
          {profile.premium && (
            <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-yellow-300 text-black">
              Premium
            </Badge>
          )}
          {profile.role === "admin" && <Badge variant="destructive">Admin</Badge>}
          {profile.role === "moderator" && <Badge variant="secondary">Moderator</Badge>}
        </div>
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
          <Avatar className="h-24 w-24 border-2 border-background">
            <AvatarImage src={profile.photoURL || "/placeholder.svg"} alt={profile.displayName} />
            <AvatarFallback className="text-lg">{getInitials(profile.displayName)}</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <CardTitle className="text-2xl">{profile.displayName}</CardTitle>
            <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {profile.location}
                </span>
              )}
              {profile.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined {formatDate(profile.createdAt)}
                </span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {profile.bio && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Bio</h3>
            <p>{profile.bio}</p>
          </div>
        )}

        {profile.interests && profile.interests.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <Badge key={interest} variant="outline">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {profile.badges && profile.badges.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Badges</h3>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge) => (
                <Badge key={badge} variant="secondary">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {profile.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Social Links</h3>
            <div className="flex flex-wrap gap-3">
              {profile.socialLinks.twitter && (
                <a
                  href={`https://twitter.com/${profile.socialLinks.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {profile.socialLinks.instagram && (
                <a
                  href={`https://instagram.com/${profile.socialLinks.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {profile.socialLinks.facebook && (
                <a
                  href={`https://facebook.com/${profile.socialLinks.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {profile.socialLinks.website && (
                <a
                  href={profile.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Globe className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-4">
            <div className="text-center">
              <p className="font-bold">{profile.followers || 0}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{profile.following || 0}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>

          {!isCurrentUser && <Button variant="outline">Follow</Button>}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        {isCurrentUser ? (
          <Link href="/dashboard/profile/edit" passHref>
            <Button variant="outline">Edit Profile</Button>
          </Link>
        ) : (
          <Button variant="default">Message</Button>
        )}
      </CardFooter>
    </Card>
  )
}
