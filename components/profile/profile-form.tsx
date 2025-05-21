"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ProfileImageUpload } from "./profile-image-upload"
import { useProfile } from "@/hooks/use-profile"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Define form validation schema
const profileFormSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: "Display name must be at least 2 characters." })
    .max(30, { message: "Display name cannot be longer than 30 characters." }),
  bio: z.string().max(160, { message: "Bio cannot be longer than 160 characters." }).optional(),
  location: z.string().max(30, { message: "Location cannot be longer than 30 characters." }).optional(),
  interests: z.string().optional(),
  twitterUsername: z.string().optional(),
  instagramUsername: z.string().optional(),
  facebookUsername: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { profile, loading, error, updateProfile, updateProfilePhoto, isCurrentUser } = useProfile()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Initialize form with current profile data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: profile?.displayName || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      interests: profile?.interests?.join(", ") || "",
      twitterUsername: profile?.socialLinks?.twitter || "",
      instagramUsername: profile?.socialLinks?.instagram || "",
      facebookUsername: profile?.socialLinks?.facebook || "",
      website: profile?.socialLinks?.website || "",
    },
    values: {
      displayName: profile?.displayName || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      interests: profile?.interests?.join(", ") || "",
      twitterUsername: profile?.socialLinks?.twitter || "",
      instagramUsername: profile?.socialLinks?.instagram || "",
      facebookUsername: profile?.socialLinks?.facebook || "",
      website: profile?.socialLinks?.website || "",
    },
  })

  // Handle form submission
  const onSubmit = async (data: ProfileFormValues) => {
    if (!isCurrentUser) {
      toast({
        title: "Permission denied",
        description: "You cannot edit another user's profile",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Convert interests string to array
      const interestsArray = data.interests
        ? data.interests
            .split(",")
            .map((interest) => interest.trim())
            .filter(Boolean)
        : []

      // Format data for update
      const profileData = {
        displayName: data.displayName,
        bio: data.bio || "",
        location: data.location || "",
        interests: interestsArray,
        socialLinks: {
          twitter: data.twitterUsername || "",
          instagram: data.instagramUsername || "",
          facebook: data.facebookUsername || "",
          website: data.website || "",
        },
      }

      // Update profile
      await updateProfile(profileData)

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle profile photo update
  const handleProfilePhotoUpdate = async (url: string) => {
    if (!isCurrentUser || !profile) return

    try {
      await updateProfilePhoto(url)
    } catch (error) {
      console.error("Error updating profile photo:", error)
      toast({
        title: "Update failed",
        description: "There was an error updating your profile photo. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 p-4 rounded-md text-destructive">
        <p>Error loading profile: {error.message}</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="bg-muted p-4 rounded-md">
        <p>Profile not found.</p>
      </div>
    )
  }

  if (!isCurrentUser) {
    return (
      <div className="bg-muted p-4 rounded-md">
        <p>You do not have permission to edit this profile.</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your profile information and social links</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProfileImageUpload
          currentPhotoURL={profile.photoURL}
          userId={profile.uid}
          onUploadComplete={handleProfilePhotoUpdate}
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
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
                    <Textarea placeholder="Tell us about yourself" {...field} />
                  </FormControl>
                  <FormDescription>Brief description for your profile.</FormDescription>
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
                      <Input placeholder="City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interests</FormLabel>
                    <FormControl>
                      <Input placeholder="Music, Art, Technology (comma separated)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Social Links</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="twitterUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter</FormLabel>
                      <FormControl>
                        <Input placeholder="username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagramUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input placeholder="username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="facebookUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input placeholder="username" {...field} />
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
            </div>

            {profile.badges && profile.badges.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((badge) => (
                    <Badge key={badge} variant="secondary">
                      {badge}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Badges are earned through participation and cannot be edited.
                </p>
              </div>
            )}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
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
      </CardContent>
    </Card>
  )
}
