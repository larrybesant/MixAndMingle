"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createOrUpdateDjProfile } from "@/app/actions/dj-profiles"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

const genres = [
  "House",
  "Techno",
  "Hip Hop",
  "R&B",
  "Pop",
  "Rock",
  "EDM",
  "Trance",
  "Drum & Bass",
  "Reggae",
  "Disco",
  "Jazz",
  "Funk",
  "Soul",
  "Latin",
  "Other",
]

export default function CreateDjProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

  const handleGenreChange = (genre: string, checked: boolean) => {
    if (checked) {
      setSelectedGenres([...selectedGenres, genre])
    } else {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.set("genres", selectedGenres.join(","))

      const result = await createOrUpdateDjProfile(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "DJ profile created successfully",
      })

      if (redirectUrl) {
        router.push(redirectUrl)
      } else {
        router.push("/dj-profile")
      }
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Create DJ Profile</h1>
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>DJ Profile Details</CardTitle>
            <CardDescription>Fill out the form below to create your DJ profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="artistName">Artist/DJ Name</Label>
              <Input id="artistName" name="artistName" placeholder="DJ Awesome" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" placeholder="Tell us about yourself as a DJ..." className="min-h-[100px]" />
            </div>

            <div className="space-y-2">
              <Label>Music Genres</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {genres.map((genre) => (
                  <div key={genre} className="flex items-center space-x-2">
                    <Checkbox
                      id={`genre-${genre}`}
                      checked={selectedGenres.includes(genre)}
                      onCheckedChange={(checked) => handleGenreChange(genre, checked === true)}
                    />
                    <Label htmlFor={`genre-${genre}`} className="text-sm font-normal">
                      {genre}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experienceYears">Years of Experience</Label>
                <Input id="experienceYears" name="experienceYears" type="number" min="0" placeholder="5" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input id="hourlyRate" name="hourlyRate" type="number" min="0" step="0.01" placeholder="100" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolioLinks">Portfolio Links</Label>
              <Textarea
                id="portfolioLinks"
                name="portfolioLinks"
                placeholder="Add links to your music, social media, or website (one per line)"
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">Add one link per line</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create DJ Profile
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
