"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { doc, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { interests } from "@/lib/data"
import { createProfile, updateProfile } from "@/services/profile-service"
import { updateUserInterests } from "@/services/interest-service"
import { updateUserLocation } from "@/services/location-service"

export default function OnboardingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [location, setLocation] = useState<{
    latitude: number | null
    longitude: number | null
    city: string
    state: string
    country: string
  }>({
    latitude: null,
    longitude: null,
    city: "",
    state: "",
    country: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  const detectLocation = () => {
    if (navigator.geolocation) {
      setGettingLocation(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          try {
            // Use a reverse geocoding service to get city, state, country
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
            )
            const data = await response.json()

            setLocation({
              latitude,
              longitude,
              city: data.address.city || data.address.town || data.address.village || "",
              state: data.address.state || "",
              country: data.address.country || "",
            })

            toast({
              title: "Location detected",
              description: `${data.address.city || data.address.town || data.address.village || ""}, ${data.address.country || ""}`,
            })
          } catch (error) {
            console.error("Error getting location details:", error)
            setLocation({
              latitude,
              longitude,
              city: "",
              state: "",
              country: "",
            })

            toast({
              title: "Location detected",
              description: "We got your coordinates, but couldn't determine your city.",
            })
          }

          setGettingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          toast({
            title: "Location error",
            description: "Could not detect your location. Please enter it manually.",
            variant: "destructive",
          })
          setGettingLocation(false)
        },
      )
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    try {
      setSubmitting(true)

      let photoURL = user.photoURL

      // Upload profile image if selected
      if (profileImage) {
        const storageRef = ref(storage, `profile_images/${user.uid}`)
        await uploadBytes(storageRef, profileImage)
        photoURL = await getDownloadURL(storageRef)
      }

      // Update user profile in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        displayName: displayName || user.displayName,
        bio,
        interests: selectedInterests,
        photoURL,
        profileComplete: true,
        updatedAt: new Date(),
      })

      // Create or update profile in Supabase
      const profileData = {
        first_name: displayName.split(" ")[0] || "",
        last_name: displayName.split(" ").slice(1).join(" ") || "",
        avatar_url: photoURL || "",
        bio,
        email: user.email || "",
        location: `${location.city}, ${location.state}, ${location.country}`.replace(/^, |, $/g, ""),
      }

      const profile = await createProfile(user.uid, profileData)

      if (!profile) {
        // Try updating instead
        await updateProfile(user.uid, profileData)
      }

      // Save user interests to Supabase
      await updateUserInterests(user.uid, selectedInterests)

      // Save user location to Supabase if available
      if (location.latitude && location.longitude) {
        await updateUserLocation(
          user.uid,
          location.latitude,
          location.longitude,
          location.city,
          location.state,
          location.country,
        )
      }

      toast({
        title: "Profile created!",
        description: "Your profile has been set up successfully.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Profile setup failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="container flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Complete Your Profile</h1>
        <p className="text-muted-foreground">Tell us about yourself to get started</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>This information will be shown to other users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={imagePreview || user?.photoURL || ""} />
                <AvatarFallback>{user?.displayName?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="picture" className="cursor-pointer text-sm font-medium text-primary">
                  Upload profile picture
                </Label>
                <Input id="picture" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={user?.displayName || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Location</Label>
                <Button type="button" variant="outline" size="sm" onClick={detectLocation} disabled={gettingLocation}>
                  {gettingLocation ? "Detecting..." : "Detect Location"}
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={location.city}
                    onChange={(e) => setLocation({ ...location, city: e.target.value })}
                    placeholder="Your city"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={location.country}
                    onChange={(e) => setLocation({ ...location, country: e.target.value })}
                    placeholder="Your country"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Interests (select at least 3)</Label>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge
                    key={interest}
                    variant={selectedInterests.includes(interest) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={submitting || selectedInterests.length < 3}>
              {submitting ? "Saving..." : "Complete Profile"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
