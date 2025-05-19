"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getProfileById, updateProfile } from "@/services/profile-service"
import { supabase } from "@/lib/supabase-client"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [matchNotifications, setMatchNotifications] = useState(true)
  const [messageNotifications, setMessageNotifications] = useState(true)

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState("public")
  const [showLocation, setShowLocation] = useState(true)
  const [showActivity, setShowActivity] = useState(true)

  // Matching preferences
  const [distanceRadius, setDistanceRadius] = useState(50)
  const [minAge, setMinAge] = useState(18)
  const [maxAge, setMaxAge] = useState(99)
  const [genderPreference, setGenderPreference] = useState("all")

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Fetch profile
        const profile = await getProfileById(user.uid)

        if (profile) {
          // Set notification settings from profile if available
          // In a real app, you would have these fields in your profile table
          setEmailNotifications(profile.email_notifications || true)
          setPushNotifications(profile.push_notifications || true)
        }

        // Fetch user preferences
        const { data: preferences } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.uid)
          .single()

        if (preferences) {
          setDistanceRadius(preferences.distance_radius || 50)
          setMinAge(preferences.min_age || 18)
          setMaxAge(preferences.max_age || 99)
          setGenderPreference(preferences.gender_preference || "all")
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [user])

  const saveNotificationSettings = async () => {
    if (!user) return

    try {
      setSaving(true)

      // Update profile with notification settings
      await updateProfile(user.uid, {
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
      })

      toast({
        title: "Settings saved",
        description: "Your notification settings have been updated.",
      })
    } catch (error) {
      console.error("Error saving notification settings:", error)
      toast({
        title: "Error",
        description: "Failed to save notification settings.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const savePrivacySettings = async () => {
    if (!user) return

    try {
      setSaving(true)

      // In a real app, you would update these fields in your database
      // For this MVP, we'll just show a success message

      toast({
        title: "Settings saved",
        description: "Your privacy settings have been updated.",
      })
    } catch (error) {
      console.error("Error saving privacy settings:", error)
      toast({
        title: "Error",
        description: "Failed to save privacy settings.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const saveMatchingPreferences = async () => {
    if (!user) return

    try {
      setSaving(true)

      // Check if preferences exist
      const { data: existingPrefs } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", user.uid)
        .single()

      if (existingPrefs) {
        // Update existing preferences
        await supabase
          .from("user_preferences")
          .update({
            distance_radius: distanceRadius,
            min_age: minAge,
            max_age: maxAge,
            gender_preference: genderPreference,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.uid)
      } else {
        // Create new preferences
        await supabase.from("user_preferences").insert({
          user_id: user.uid,
          distance_radius: distanceRadius,
          min_age: minAge,
          max_age: maxAge,
          gender_preference: genderPreference,
        })
      }

      toast({
        title: "Settings saved",
        description: "Your matching preferences have been updated.",
      })
    } catch (error) {
      console.error("Error saving matching preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save matching preferences.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading settings...</div>
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="matching">Matching</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                </div>
                <Switch id="push-notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="match-notifications">Match Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified when you have a new match</p>
                </div>
                <Switch id="match-notifications" checked={matchNotifications} onCheckedChange={setMatchNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="message-notifications">Message Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified when you receive a new message</p>
                </div>
                <Switch
                  id="message-notifications"
                  checked={messageNotifications}
                  onCheckedChange={setMessageNotifications}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveNotificationSettings} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-visibility">Profile Visibility</Label>
                <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                  <SelectTrigger id="profile-visibility">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="matches-only">Matches Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Control who can see your profile</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-location">Show Location</Label>
                  <p className="text-sm text-muted-foreground">Allow others to see your approximate location</p>
                </div>
                <Switch id="show-location" checked={showLocation} onCheckedChange={setShowLocation} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-activity">Show Activity Status</Label>
                  <p className="text-sm text-muted-foreground">Show when you're online or last active</p>
                </div>
                <Switch id="show-activity" checked={showActivity} onCheckedChange={setShowActivity} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={savePrivacySettings} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="matching">
          <Card>
            <CardHeader>
              <CardTitle>Matching Preferences</CardTitle>
              <CardDescription>Customize how we match you with others</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="distance-radius">Distance Radius: {distanceRadius} km</Label>
                </div>
                <Slider
                  id="distance-radius"
                  min={5}
                  max={100}
                  step={5}
                  value={[distanceRadius]}
                  onValueChange={(value) => setDistanceRadius(value[0])}
                />
                <p className="text-sm text-muted-foreground">Maximum distance for potential matches</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-age">Minimum Age</Label>
                  <Input
                    id="min-age"
                    type="number"
                    min={18}
                    max={maxAge}
                    value={minAge}
                    onChange={(e) => setMinAge(Number.parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-age">Maximum Age</Label>
                  <Input
                    id="max-age"
                    type="number"
                    min={minAge}
                    value={maxAge}
                    onChange={(e) => setMaxAge(Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender-preference">Gender Preference</Label>
                <Select value={genderPreference} onValueChange={setGenderPreference}>
                  <SelectTrigger id="gender-preference">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="male">Men</SelectItem>
                    <SelectItem value="female">Women</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveMatchingPreferences} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
