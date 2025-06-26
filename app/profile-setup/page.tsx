"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Save, Upload, X, Loader2, CheckCircle, AlertCircle, Music, Heart, MapPin, User } from "lucide-react"

interface ProfileFormData {
  username: string
  full_name: string
  bio: string
  location: string
  website: string
  music_preferences: string[]
  relationship_style: string
  gender: string
  age: string
  is_dj: boolean
}

const MUSIC_GENRES = [
  "House",
  "Techno",
  "Hip-Hop",
  "R&B",
  "Pop",
  "Rock",
  "Electronic",
  "Jazz",
  "Reggae",
  "Latin",
  "Country",
  "Alternative",
  "Indie",
  "Classical",
  "Blues",
  "Funk",
]

const RELATIONSHIP_STYLES = [
  { value: "traditional", label: "Traditional/Monogamous" },
  { value: "poly", label: "Polyamorous" },
  { value: "open", label: "Open Relationship" },
  { value: "casual", label: "Casual Dating" },
  { value: "friends", label: "Friends First" },
  { value: "other", label: "Other" },
]

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "nonbinary", label: "Non-binary" },
  { value: "transgender", label: "Transgender" },
  { value: "genderfluid", label: "Gender Fluid" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
]

export default function ProfileSetupPage() {
  const { user, updateProfile, loading } = useAuth()
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ProfileFormData>({
    username: "",
    full_name: "",
    bio: "",
    location: "",
    website: "",
    music_preferences: [],
    relationship_style: "",
    gender: "",
    age: "",
    is_dj: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string>("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const calculateProgress = () => {
    const fields = [
      formData.username,
      formData.full_name,
      formData.bio,
      formData.location,
      formData.music_preferences.length > 0,
      formData.relationship_style,
      formData.gender,
      formData.age,
    ]
    const completed = fields.filter(Boolean).length
    return Math.round((completed / fields.length) * 100)
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.username.trim()) {
        newErrors.username = "Username is required"
      } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
        newErrors.username = "Username must be 3-20 characters, letters, numbers, and underscores only"
      }

      if (!formData.full_name.trim()) {
        newErrors.full_name = "Full name is required"
      } else if (formData.full_name.trim().length < 2) {
        newErrors.full_name = "Full name must be at least 2 characters"
      }

      if (!formData.age) {
        newErrors.age = "Age is required"
      } else if (Number.parseInt(formData.age) < 18 || Number.parseInt(formData.age) > 100) {
        newErrors.age = "Age must be between 18 and 100"
      }
    }

    if (step === 2) {
      if (!formData.bio.trim()) {
        newErrors.bio = "Bio is required"
      } else if (formData.bio.length < 20) {
        newErrors.bio = "Bio must be at least 20 characters"
      } else if (formData.bio.length > 500) {
        newErrors.bio = "Bio must be 500 characters or less"
      }

      if (!formData.location.trim()) {
        newErrors.location = "Location is required"
      }

      if (formData.website && !isValidUrl(formData.website)) {
        newErrors.website = "Please enter a valid URL"
      }
    }

    if (step === 3) {
      if (formData.music_preferences.length === 0) {
        newErrors.music_preferences = "Please select at least one music genre"
      }

      if (!formData.relationship_style) {
        newErrors.relationship_style = "Please select your relationship style"
      }

      if (!formData.gender) {
        newErrors.gender = "Please select your gender"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleInputChange = (field: keyof ProfileFormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, avatar: "File size must be less than 5MB" }))
        return
      }

      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, avatar: "File must be an image" }))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      if (errors.avatar) {
        setErrors((prev) => ({ ...prev, avatar: "" }))
      }
    }
  }

  const addMusicGenre = (genre: string) => {
    if (!formData.music_preferences.includes(genre)) {
      setFormData((prev) => ({
        ...prev,
        music_preferences: [...prev.music_preferences, genre],
      }))
    }
  }

  const removeMusicGenre = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      music_preferences: prev.music_preferences.filter((g) => g !== genre),
    }))
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return
    }

    setIsLoading(true)

    try {
      const { error } = await updateProfile({
        username: formData.username,
        full_name: formData.full_name,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        music_preferences: formData.music_preferences,
        is_dj: formData.is_dj,
        avatar_url: avatarPreview,
        profile_completed: true,
      })

      if (error) {
        if (error.message.includes("username")) {
          setErrors({ username: "Username is already taken" })
          setCurrentStep(1)
        } else {
          setErrors({ general: error.message })
        }
      } else {
        setIsSaved(true)
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      }
    } catch (err) {
      setErrors({ general: "An unexpected error occurred" })
    } finally {
      setIsLoading(false)
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (isSaved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black">
        <Card className="w-full max-w-md bg-black/80 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Profile Complete!</h2>
              <p className="text-gray-400">Welcome to Mix & Mingle! Redirecting to your dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Header */}
      <header className="border-b border-purple-500/30 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => (currentStep > 1 ? handlePrevious() : router.back())}
                className="border-purple-400 text-purple-400 hover:bg-purple-400/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {currentStep > 1 ? "Previous" : "Back"}
              </Button>
              <h1 className="text-2xl font-bold text-white">Complete Your Profile</h1>
            </div>
            <div className="text-sm text-gray-400">Step {currentStep} of 3</div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Profile Completion</span>
              <span>{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Error Alert */}
          {errors.general && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <Card className="bg-black/40 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                {currentStep === 1 && (
                  <>
                    <User className="w-5 h-5 mr-2" />
                    Basic Information
                  </>
                )}
                {currentStep === 2 && (
                  <>
                    <MapPin className="w-5 h-5 mr-2" />
                    About You
                  </>
                )}
                {currentStep === 3 && (
                  <>
                    <Heart className="w-5 h-5 mr-2" />
                    Preferences
                  </>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <>
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={avatarPreview || "/placeholder.svg"} alt="Profile" />
                      <AvatarFallback className="bg-purple-600 text-white text-lg">
                        {getInitials(formData.full_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col items-center space-y-2">
                      <Label htmlFor="avatar" className="cursor-pointer">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-purple-400 text-purple-400 hover:bg-purple-400/10"
                          asChild
                        >
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Photo
                          </span>
                        </Button>
                      </Label>
                      <input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      {errors.avatar && <p className="text-sm text-red-400">{errors.avatar}</p>}
                    </div>
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white">
                      Username *
                    </Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
                      placeholder="Enter username"
                    />
                    {errors.username && <p className="text-sm text-red-400">{errors.username}</p>}
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-white">
                      Full Name *
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
                      placeholder="Enter your full name"
                    />
                    {errors.full_name && <p className="text-sm text-red-400">{errors.full_name}</p>}
                  </div>

                  {/* Age */}
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-white">
                      Age *
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      min="18"
                      max="100"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
                      placeholder="Enter your age"
                    />
                    {errors.age && <p className="text-sm text-red-400">{errors.age}</p>}
                  </div>
                </>
              )}

              {/* Step 2: About You */}
              {currentStep === 2 && (
                <>
                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-white">
                      Bio *
                    </Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 min-h-[120px]"
                      placeholder="Tell us about yourself, your interests, what you're looking for..."
                      maxLength={500}
                    />
                    <div className="flex justify-between text-sm">
                      {errors.bio && <p className="text-red-400">{errors.bio}</p>}
                      <p className="text-gray-400 ml-auto">{formData.bio.length}/500</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-white">
                      Location *
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
                      placeholder="City, State/Country"
                    />
                    {errors.location && <p className="text-sm text-red-400">{errors.location}</p>}
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-white">
                      Website/Social Media
                    </Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
                      placeholder="https://yourwebsite.com or @yourusername"
                    />
                    {errors.website && <p className="text-sm text-red-400">{errors.website}</p>}
                  </div>

                  {/* DJ Status */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_dj"
                      checked={formData.is_dj}
                      onChange={(e) => handleInputChange("is_dj", e.target.checked)}
                      className="rounded border-gray-600 bg-gray-900 text-purple-600 focus:ring-purple-500"
                    />
                    <Label htmlFor="is_dj" className="text-white">
                      I'm a DJ or music creator
                    </Label>
                  </div>
                </>
              )}

              {/* Step 3: Preferences */}
              {currentStep === 3 && (
                <>
                  {/* Music Preferences */}
                  <div className="space-y-4">
                    <Label className="text-white flex items-center">
                      <Music className="w-4 h-4 mr-2" />
                      Music Preferences *
                    </Label>

                    <div className="flex flex-wrap gap-2">
                      {formData.music_preferences.map((genre, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="border-purple-400 text-purple-400 pl-2 pr-1 py-1"
                        >
                          {genre}
                          <button
                            type="button"
                            onClick={() => removeMusicGenre(genre)}
                            className="ml-1 hover:bg-purple-400/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {MUSIC_GENRES.map((genre) => (
                        <Button
                          key={genre}
                          type="button"
                          variant={formData.music_preferences.includes(genre) ? "default" : "outline"}
                          size="sm"
                          onClick={() => addMusicGenre(genre)}
                          className={
                            formData.music_preferences.includes(genre)
                              ? "bg-purple-600 hover:bg-purple-700"
                              : "border-gray-600 text-gray-400 hover:bg-gray-800"
                          }
                        >
                          {genre}
                        </Button>
                      ))}
                    </div>

                    {errors.music_preferences && <p className="text-sm text-red-400">{errors.music_preferences}</p>}
                  </div>

                  {/* Relationship Style */}
                  <div className="space-y-2">
                    <Label className="text-white">Relationship Style *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {RELATIONSHIP_STYLES.map((style) => (
                        <Button
                          key={style.value}
                          type="button"
                          variant={formData.relationship_style === style.value ? "default" : "outline"}
                          onClick={() => handleInputChange("relationship_style", style.value)}
                          className={
                            formData.relationship_style === style.value
                              ? "bg-purple-600 hover:bg-purple-700 justify-start"
                              : "border-gray-600 text-gray-400 hover:bg-gray-800 justify-start"
                          }
                        >
                          {style.label}
                        </Button>
                      ))}
                    </div>
                    {errors.relationship_style && <p className="text-sm text-red-400">{errors.relationship_style}</p>}
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label className="text-white">Gender *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {GENDERS.map((gender) => (
                        <Button
                          key={gender.value}
                          type="button"
                          variant={formData.gender === gender.value ? "default" : "outline"}
                          onClick={() => handleInputChange("gender", gender.value)}
                          className={
                            formData.gender === gender.value
                              ? "bg-purple-600 hover:bg-purple-700 justify-start"
                              : "border-gray-600 text-gray-400 hover:bg-gray-800 justify-start"
                          }
                        >
                          {gender.label}
                        </Button>
                      ))}
                    </div>
                    {errors.gender && <p className="text-sm text-red-400">{errors.gender}</p>}
                  </div>
                </>
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="border-gray-600 text-gray-400 hover:bg-gray-800"
              >
                Previous
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Complete Profile
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
