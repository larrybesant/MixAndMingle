"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Form fields
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [musicInterests, setMusicInterests] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      try {
        // Get the current user
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) throw userError
        if (!currentUser) {
          router.push("/signin")
          return
        }

        setUser(currentUser)

        // Get the user's profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError
        }

        if (profileData) {
          setProfile(profileData)
          setName(profileData.full_name || "")
          setBio(profileData.bio || "")
          setLocation(profileData.location || "")
          setMusicInterests(profileData.music_interests || "")
          setAvatarUrl(profileData.avatar_url || "")
          setEmailNotifications(profileData.email_notifications !== false)
          setPushNotifications(profileData.push_notifications !== false)
        }
      } catch (error: any) {
        console.error("Error loading profile:", error.message)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router, supabase])

  const handleSaveProfile = async () => {
    setSaving(true)
    setMessage(null)

    try {
      if (!user) throw new Error("User not authenticated")

      const updates = {
        id: user.id,
        full_name: name,
        bio,
        location,
        music_interests: musicInterests,
        avatar_url: avatarUrl,
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("profiles").upsert(updates)

      if (error) throw error

      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      })

      // Refresh profile data
      const { data: refreshedProfile, error: refreshError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (!refreshError) {
        setProfile(refreshedProfile)
      }
    } catch (error: any) {
      console.error("Error updating profile:", error.message)
      setMessage({
        type: "error",
        text: error.message || "An error occurred while updating your profile.",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      {message && (
        <Alert
          variant={message.type === "error" ? "destructive" : "default"}
          className={`mb-6 ${
            message.type === "error"
              ? "border-red-900 bg-red-950 text-red-400"
              : "border-green-900 bg-green-950 text-green-400"
          }`}
        >
          {message.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertTitle>{message.type === "error" ? "Error" : "Success"}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={avatarUrl || "/placeholder.svg?height=128&width=128&query=user"} />
                <AvatarFallback>
                  {name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 w-full">
                <Label htmlFor="avatarUrl">Profile Picture URL</Label>
                <Input
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/your-image.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Enter a URL for your profile picture. Image upload coming soon!
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Email</span>
                  <p>{user?.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Member Since</span>
                  <p>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Beta Tester</span>
                  <p>{profile?.is_beta_tester ? "Yes" : "No"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences">Music Preferences</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Music Preferences</CardTitle>
                  <CardDescription>Tell us about your music taste</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="musicInterests">Favorite Genres & Artists</Label>
                    <Textarea
                      id="musicInterests"
                      value={musicInterests}
                      onChange={(e) => setMusicInterests(e.target.value)}
                      placeholder="Share your favorite music genres, artists, and DJs"
                      rows={6}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about events and streams via email
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="pushNotifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive real-time notifications in your browser</p>
                    </div>
                    <Switch id="pushNotifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveProfile} disabled={saving} className="w-full md:w-auto">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
