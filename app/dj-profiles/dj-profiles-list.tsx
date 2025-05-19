"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MusicIcon, InstagramIcon, ExternalLinkIcon } from "lucide-react"
import Image from "next/image"

interface DjProfile {
  id: string
  name: string
  genre: string
  bio: string
  profileImage: string
  socialLinks?: {
    instagram?: string
    soundcloud?: string
    [key: string]: string | undefined
  }
}

interface DjProfilesListProps {
  djProfiles: DjProfile[]
}

export function DjProfilesList({ djProfiles }: DjProfilesListProps) {
  if (!djProfiles || djProfiles.length === 0) {
    return (
      <div className="text-center p-12 border border-dashed rounded-lg">
        <h3 className="text-lg font-medium">No DJ profiles found</h3>
        <p className="text-muted-foreground mt-1">Create your DJ profile to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {djProfiles.map((profile) => (
        <Card key={profile.id}>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-full overflow-hidden">
                <Image
                  src={profile.profileImage || "/placeholder.svg"}
                  alt={profile.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <CardTitle>{profile.name}</CardTitle>
                <CardDescription className="flex items-center">
                  <MusicIcon className="mr-1 h-3 w-3" />
                  {profile.genre}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{profile.bio}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" className="w-full">
              View Profile
            </Button>
            {profile.socialLinks && (
              <div className="flex gap-2 ml-2">
                {profile.socialLinks.instagram && (
                  <Button size="icon" variant="ghost" asChild>
                    <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                      <InstagramIcon className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {profile.socialLinks.soundcloud && (
                  <Button size="icon" variant="ghost" asChild>
                    <a href={profile.socialLinks.soundcloud} target="_blank" rel="noopener noreferrer">
                      <ExternalLinkIcon className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
