"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useProfile } from "@/hooks/use-profile"
import { useAuthState } from "@/hooks/use-auth-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Camera, X } from "lucide-react"

// Define the form schema
const profileFormSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: "Display name must be at least 2 characters." })
    .max(30, { message: "Display name cannot be longer than 30 characters." }),
  bio: z.string().max(160, { message: "Bio cannot be longer than 160 characters." }).optional(),
  location: z.string().max(30, { message: "Location cannot be longer than 30 characters." }).optional(),
  website: z.string().url({ message: "Please enter a valid URL." }).or(z.literal("")).optional(),
  interests: z.string().max(100, { message: "Interests cannot be longer than 100 characters." }).optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileEditor() {
  const { user } = useAuthState()
  const { profile, loading: profileLoading, error, updateProfile, uploadProfileImage } = useProfile()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Initialize the form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      location: "",
      website: "",
      interests: "",
    },
  })

  // Update form values when profile data is loaded
  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName || user?.displayName || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
        interests: Array.isArray(profile.interests) ? profile.interests.join(", ") : profile.interests || "",
      })
    }
  }, [profile, user, form])

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      // Create a preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Clear selected image
  const clearSelectedImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  // Handle form submission
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      // Process interests from comma-separated string to array
      const interestsArray = data.interests
        ? data.interests
            .split(",")
            .map((interest) => interest.trim())
            .filter(Boolean)
        : []

      // Upload image if selected
      if (imageFile) {
        setUploading(true)
        await uploadProfileImage(imageFile)
        setUploading(false)
        setImageFile(null)
        setImagePreview(null)
      }

      // Update profile data
      await updateProfile({
        displayName: data.displayName,
        bio: data.bio,
        location: data.location,
        website: data.website,
        interests: interestsArray,
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      })
    }
  }

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 p-4 rounded-md">
        <p className="text-destructive">Error loading profile: {error.message}</p>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your profile information and profile picture.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={imagePreview || profile?.photoURL || user?.photoURL || ""}
                alt={profile?.displayName || user?.displayName || "Profile"}
              />
              <AvatarFallback>
                {profile?.displayName?.[0] || user?.displayName?.[0] || user?.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex items-center space-x-2">
              <label htmlFor="picture" className="cursor-pointer">
                <div className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                  <Camera size={16} />
                  <span>Change Picture</span>
                </div>
                <input
                  id="picture"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={uploading}
                />
              </label>

              {imagePreview && (
                <Button variant="outline" size="icon" onClick={clearSelectedImage} disabled={uploading}>
                  <X size={16} />
                </Button>
              )}
            </div>

            {uploading && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading image...</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Profile Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your display name" {...field} />
                    </FormControl>
                    <FormDescription>This is your public display name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us a little bit about yourself" className="resize-none" {...field} />
                    </FormControl>
                    <FormDescription>Your bio will be shown on your profile.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Your location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://yourwebsite.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interests</FormLabel>
                    <FormControl>
                      <Input placeholder="Music, Gaming, Travel, etc. (comma separated)" {...field} />
                    </FormControl>
                    <FormDescription>Add your interests separated by commas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || uploading}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  )
}
