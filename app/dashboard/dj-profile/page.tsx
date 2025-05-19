"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  hasDjProfile,
  getDjProfileByUserId,
  upsertDjProfile,
  getDjGenres,
  addDjGenre,
  removeDjGenre,
} from "@/services/dj-service"
import { getAllGenres } from "@/services/music-service"

export default function DjProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [hasDj, setHasDj] = useState(false)
  const [artistName, setArtistName] = useState("")
  const [bio, setBio] = useState("")
  const [experienceYears, setExperienceYears] = useState<number | undefined>(undefined)
  const [hourlyRate, setHourlyRate] = useState<number | undefined>(undefined)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [allGenres, setAllGenres] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Check if user has a DJ profile
        const hasProfile = await hasDjProfile(user.uid)
        setHasDj(hasProfile)

        if (hasProfile) {
          // Fetch DJ profile
          const profile = await getDjProfileByUserId(user.uid)
          if (profile) {
            setArtistName(profile.artist_name || "")
            setBio(profile.bio || "")
            setExperienceYears(profile.experience_years)
            setHourlyRate(profile.hourly_rate)

            // Fetch DJ genres
            const genres = await getDjGenres(profile.id)
            setSelectedGenres(genres.map((genre) => genre.id))
          }
        }

        // Fetch all genres
        const genres = await getAllGenres()
        setAllGenres(genres)
      } catch (error) {
        console.error("Error fetching DJ profile:", error)
        toast({
          title: "Error",
          description: "Failed to load DJ profile data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    try {
      setSubmitting(true)

      // Create or update DJ profile
      const profile = await upsertDjProfile(user.uid, {
        artist_name: artistName,
        bio,
        experience_years: experienceYears,
        hourly_rate: hourlyRate,
      })

      if (profile) {
        // Update genres
        const currentGenres = await getDjGenres(profile.id)
        const currentGenreIds = currentGenres.map((genre) => genre.id)

        // Add new genres
        for (const genreId of selectedGenres) {
          if (!currentGenreIds.includes(genreId)) {
            await addDjGenre(profile.id, genreId)
          }
        }

        // Remove old genres
        for (const genreId of currentGenreIds) {
          if (!selectedGenres.includes(genreId)) {
            await removeDjGenre(profile.id, genreId)
          }
        }

        toast({
          title: "DJ Profile Saved",
          description: "Your DJ profile has been updated successfully",
        })

        setHasDj(true)
      }
    } catch (error) {
      console.error("Error saving DJ profile:", error)
      toast({
        title: "Error",
        description: "Failed to save DJ profile",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const toggleGenre = (genreId: string) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter((id) => id !== genreId))
    } else {
      setSelectedGenres([...selectedGenres, genreId])
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">DJ Profile</h2>
        <p className="text-gray-400">
          {hasDj
            ? "Manage your DJ profile and start streaming"
            : "Create a DJ profile to start streaming and get booked for events"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">DJ Information</CardTitle>
            <CardDescription className="text-gray-400">This information will be visible to other users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="artistName" className="text-white">
                Artist/DJ Name
              </Label>
              <Input
                id="artistName"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Your DJ name"
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-white">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about your music style and experience"
                rows={4}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experienceYears" className="text-white">
                  Years of Experience
                </Label>
                <Input
                  id="experienceYears"
                  type="number"
                  min="0"
                  value={experienceYears || ""}
                  onChange={(e) => setExperienceYears(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                  placeholder="Years of experience"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate" className="text-white">
                  Hourly Rate ($)
                </Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={hourlyRate || ""}
                  onChange={(e) => setHourlyRate(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                  placeholder="Your hourly rate"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Music Genres</Label>
              <div className="flex flex-wrap gap-2">
                {allGenres.map((genre) => (
                  <Badge
                    key={genre.id}
                    variant={selectedGenres.includes(genre.id) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedGenres.includes(genre.id)
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-gray-700 text-gray-400 hover:border-gray-600"
                    }`}
                    onClick={() => toggleGenre(genre.id)}
                  >
                    {genre.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={submitting || !artistName}>
              {submitting ? "Saving..." : hasDj ? "Update DJ Profile" : "Create DJ Profile"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {hasDj && (
        <div className="flex justify-center">
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/dashboard/streams/create")}>
            Create New Stream
          </Button>
        </div>
      )}
    </div>
  )
}
