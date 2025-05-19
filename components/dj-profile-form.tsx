"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createDjProfile, updateDjProfile } from "@/services/dj-service"

interface DjProfileFormProps {
  existingProfile?: any
}

export function DjProfileForm({ existingProfile }: DjProfileFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [artistName, setArtistName] = useState("")
  const [bio, setBio] = useState("")
  const [experienceYears, setExperienceYears] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")

  // Load existing profile data if available
  useEffect(() => {
    if (existingProfile) {
      setArtistName(existingProfile.artist_name || "")
      setBio(existingProfile.bio || "")
      setExperienceYears(existingProfile.experience_years?.toString() || "")
      setHourlyRate(existingProfile.hourly_rate?.toString() || "")
    }
  }, [existingProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a DJ profile",
        variant: "destructive",
      })
      return
    }

    if (!artistName) {
      toast({
        title: "Error",
        description: "Please enter your artist name",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const profileData = {
        artist_name: artistName,
        bio,
        experience_years: experienceYears ? Number.parseInt(experienceYears) : undefined,
        hourly_rate: hourlyRate ? Number.parseFloat(hourlyRate) : undefined,
      }

      if (existingProfile) {
        // Update existing profile
        await updateDjProfile(existingProfile.id, profileData)
        toast({
          title: "Success",
          description: "DJ profile updated successfully",
        })
      } else {
        // Create new profile
        await createDjProfile(user.uid, profileData)
        toast({
          title: "Success",
          description: "DJ profile created successfully",
        })
      }

      router.push("/dashboard/streams")
    } catch (error) {
      console.error("Error saving DJ profile:", error)
      toast({
        title: "Error",
        description: "Failed to save DJ profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{existingProfile ? "Edit DJ Profile" : "Create DJ Profile"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="artistName">Artist Name *</Label>
            <Input
              id="artistName"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="DJ Awesome"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself as a DJ..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experienceYears">Years of Experience</Label>
            <Input
              id="experienceYears"
              type="number"
              min="0"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              placeholder="5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
            <Input
              id="hourlyRate"
              type="number"
              min="0"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="100.00"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : existingProfile ? "Update Profile" : "Create Profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
