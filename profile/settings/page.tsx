"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import supabase from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EnhancedNavbar } from "@/components/features/enhanced-navbar"
import { User, Music, Bell, Shield, Save, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProfileSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
    music_preferences: [] as string[],
  })
  const [newPreference, setNewPreference] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const musicGenres = [
    "Electronic",
    "Hip Hop",
    "House",
    "Techno",
    "Trance",
    "Drum & Bass",
    "Dubstep",
    "Jazz",
    "Rock",
    "Pop",
    "R&B",
    "Reggae",
    "Classical",
    "Ambient",
    "Experimental",
    "Other",
  ]

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.replace("/login")
        return
      }

      setUser(userData.user)

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()

      if (profileData) {
        setProfile(profileData)
        setFormData({
          username: profileData.username || "",
          full_name: profileData.full_name || "",
          bio: profileData.bio || "",
          music_preferences: profileData.music_preferences || [],
        })
      }

      setLoading(false)
    }

    loadProfile()
  }, [router])

  const addMusicPreference = () => {
    if (
      newPreference &&
      !formData.music_preferences.includes(newPreference) &&
      formData.music_preferences.length < 10
    ) {
      setFormData((prev) => ({
        ...prev,
        music_preferences: [...prev.music_preferences, newPreference],
      }))
      setNewPreference("")
    }
  }

  const removeMusicPreference = (preference: string) => {
    setFormData((prev) => ({
      ...prev,
      music_preferences: prev.music_preferences.filter((p) => p !== preference),
    }))
  }

  const saveProfile = async () => {
    setSaving(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username.trim(),
          full_name: formData.full_name.trim(),
          bio: formData.bio.trim() || null,
          music_preferences: formData.music_preferences.length > 0 ? formData.music_preferences : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        throw error
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      })

      // Refresh profile data
      const { data: updatedProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      setProfile(updatedProfile)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <EnhancedNavbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-white text-xl">Loading profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <EnhancedNavbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your Mix & Mingle profile and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-purple-500/30">
                  <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.username} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xl">
                    {getInitials(profile?.full_name || profile?.username)}
                  </AvatarFallback>
                </Avatar>

                <h3 className="text-xl font-bold text-white mb-1">{profile?.username || "Anonymous"}</h3>
                <p className="text-gray-400 text-sm mb-4">{user?.email}</p>

                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  <Upload className="w-4 h-4 mr-2" />
                  Change Avatar
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Member since</span>
                    <span className="text-white text-sm">{new Date(profile?.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Profile views</span>
                    <span className="text-white text-sm">{Math.floor(Math.random() * 1000) + 100}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Form */}
          <div className="lg:col-span-2">
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username" className="text-white mb-2 block">
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                        className="bg-slate-800 border-slate-600 text-white"
                        placeholder="Your unique username"
                        maxLength={30}
                      />
                    </div>

                    <div>
                      <Label htmlFor="full_name" className="text-white mb-2 block">
                        Display Name
                      </Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                        className="bg-slate-800 border-slate-600 text-white"
                        placeholder="Your display name"
                        maxLength={50}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="bio" className="text-white mb-2 block">
                      Bio
                    </Label>
                    <Input
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Tell the community about yourself..."
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/200 characters</p>
                  </div>
                </div>

                {/* Music Preferences */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    Music Preferences
                  </h3>

                  <div className="flex gap-2 mb-4">
                    <Select value={newPreference} onValueChange={setNewPreference}>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue placeholder="Add a music genre" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {musicGenres
                          .filter((genre) => !formData.music_preferences.includes(genre))
                          .map((genre) => (
                            <SelectItem key={genre} value={genre} className="text-white hover:bg-slate-700">
                              {genre}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={addMusicPreference}
                      disabled={!newPreference || formData.music_preferences.length >= 10}
                      variant="outline"
                      className="border-slate-600 text-white hover:bg-slate-700"
                    >
                      Add
                    </Button>
                  </div>

                  {formData.music_preferences.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.music_preferences.map((preference) => (
                        <Badge
                          key={preference}
                          variant="genre"
                          className="cursor-pointer hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-300"
                          onClick={() => removeMusicPreference(preference)}
                        >
                          {preference}
                          <X className="w-3 h-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    {formData.music_preferences.length}/10 preferences • Click to remove
                  </p>
                </div>

                {/* Notification Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Settings
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">New followers</p>
                        <p className="text-gray-400 text-sm">Get notified when someone follows you</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-slate-600 text-white">
                        Enable
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Room invites</p>
                        <p className="text-gray-400 text-sm">Get notified when invited to DJ rooms</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-slate-600 text-white">
                        Enable
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Live streams</p>
                        <p className="text-gray-400 text-sm">Get notified when followed DJs go live</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-slate-600 text-white">
                        Enable
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacy Settings
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Profile visibility</p>
                        <p className="text-gray-400 text-sm">Who can see your profile</p>
                      </div>
                      <Select defaultValue="public">
                        <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="public" className="text-white">
                            Public
                          </SelectItem>
                          <SelectItem value="friends" className="text-white">
                            Friends
                          </SelectItem>
                          <SelectItem value="private" className="text-white">
                            Private
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Show online status</p>
                        <p className="text-gray-400 text-sm">Let others see when you're online</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-slate-600 text-white">
                        On
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-6 border-t border-white/10">
                  <Button
                    onClick={saveProfile}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
