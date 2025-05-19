"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

interface DjProfilesListProps {
  djProfiles: any[]
}

export function DjProfilesList({ djProfiles }: DjProfilesListProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const checkIfUserHasDjProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/signin")
      return
    }

    const { data } = await supabase.from("dj_profiles").select("id").eq("id", user.id).single()

    if (data) {
      router.push("/dj-profile")
    } else {
      router.push("/dj-profile/create")
    }
  }

  if (!djProfiles || djProfiles.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No DJ profiles found</h3>
        <p className="text-muted-foreground mt-1">Create your DJ profile to get started</p>
        <Button className="mt-4" onClick={checkIfUserHasDjProfile}>
          Create DJ Profile
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {djProfiles.map((profile) => (
        <Card key={profile.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile.profiles?.avatar_url || "/placeholder.svg"} alt={profile.artist_name} />
                <AvatarFallback>{profile.artist_name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{profile.artist_name}</CardTitle>
                <CardDescription>
                  {profile.experience_years} {profile.experience_years === 1 ? "year" : "years"} of experience
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {profile.bio && <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>}
            <div className="flex flex-wrap gap-1 mt-2">
              {profile.genre &&
                profile.genre.map((genre: string) => (
                  <Badge key={genre} variant="outline">
                    {genre}
                  </Badge>
                ))}
            </div>
          </CardContent>
          <CardFooter className="pt-3">
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/dj-profiles/${profile.id}`}>View Profile</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
