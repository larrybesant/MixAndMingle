"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createOrUpdateDjProfile } from "@/app/actions/dj-profiles"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface DjProfileFormProps {
  profile?: {
    artist_name: string
    bio: string
    genre: string[]
    experience_years: number
    hourly_rate: number
    portfolio_links: string[]
  }
}

export default function DjProfileForm({ profile }: DjProfileFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      const result = await createOrUpdateDjProfile(formData)
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
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
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
        <CardTitle className="text-2xl">DJ Profile</CardTitle>
        <CardDescription className="text-white/80">Set up your DJ profile to start streaming live sets</CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="artistName">Artist/DJ Name</Label>
            <Input
              id="artistName"
              name="artistName"
              defaultValue={profile?.artist_name || ""}
              required
              placeholder="Your stage name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={profile?.bio || ""}
              placeholder="Tell us about yourself and your music style"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genres">Genres</Label>
            <Input
              id="genres"
              name="genres"
              defaultValue={profile?.genre?.join(", ") || ""}
              placeholder="House, Techno, Hip-Hop, etc. (comma separated)"
            />
            <p className="text-sm text-muted-foreground">Separate genres with commas</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experienceYears">Years of Experience</Label>
              <Input
                id="experienceYears"
                name="experienceYears"
                type="number"
                min="0"
                defaultValue={profile?.experience_years || 0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                defaultValue={profile?.hourly_rate || 0}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolioLinks">Portfolio Links</Label>
            <Textarea
              id="portfolioLinks"
              name="portfolioLinks"
              defaultValue={profile?.portfolio_links?.join("\n") || ""}
              placeholder="SoundCloud, Mixcloud, Instagram, etc. (one per line)"
              rows={3}
            />
            <p className="text-sm text-muted-foreground">Add one link per line</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
          >
            {isSubmitting ? "Saving..." : profile ? "Update Profile" : "Create Profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
