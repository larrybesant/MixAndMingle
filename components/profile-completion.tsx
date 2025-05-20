"use client"

import type React from "react"

import { useState } from "react"
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
import { toast } from "@/components/ui/use-toast"
import { Loader2, Camera, X } from "lucide-react"
import { useRouter } from "next/navigation"

// Define the form schema
const profileCompletionSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: "Display name must be at least 2 characters." })
    .max(30, { message: "Display name cannot be longer than 30 characters." }),
  bio: z.string().max(160, { message: "Bio cannot be longer than 160 characters." }).optional(),
  location: z.string().max(30, { message: "Location cannot be longer than 30 characters." }).optional(),
})

type ProfileCompletionValues = z.infer<typeof profileCompletionSchema>

interface ProfileCompletionProps {
  onComplete?: () => void
}

export function ProfileCompletion({ onComplete }: ProfileCompletionProps) {
  const { user } = useAuthState()
  const { createProfile, uploadProfileImage } = useProfile()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  // Initialize the form
  const form = useForm<ProfileCompletionValues>({
    resolver: zodResolver(profileCompletionSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      bio: "",
      location: "",
    },
  })

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
  const onSubmit = async (data: ProfileCompletionValues) => {
    try {
      let photoURL = user?.photoURL || ""

      // Upload image if selected
      if (imageFile) {
        setUploading(true)
        photoURL = await uploadProfileImage(imageFile)
        setUploading(false)
      }

      // Create profile
      await createProfile({
        displayName: data.displayName,
        photoURL,
        bio: data.bio,
        location: data.location,
      })

      toast({
        title: "Profile created",
        description: "Your profile has been set up successfully.",
      })

      // Call onComplete callback or redirect
      if (onComplete) {
        onComplete()
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error creating profile:", error)
      toast({
        title: "Error",
        description: "There was a problem setting up your profile.",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return (
      <div className="bg-muted p-4 rounded-md">
        <p className="text-muted-foreground">Please sign in to complete your profile</p>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>Let's set up your profile so others can get to know you better.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={imagePreview || user.photoURL || ""} alt={user.displayName || "Profile"} />
              <AvatarFallback>{user.displayName?.[0] || user.email?.[0] || "U"}</AvatarFallback>
            </Avatar>

            <div className="flex items-center space-x-2">
              <label htmlFor="picture" className="cursor-pointer">
                <div className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                  <Camera size={16} />
                  <span>Upload Picture</span>
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
                    <FormDescription>This is how you'll appear to others.</FormDescription>
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
                    <FormDescription>Share something about yourself with the community.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Your location (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || uploading}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  "Complete Profile"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  )
}
