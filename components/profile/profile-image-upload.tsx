"use client"

import type React from "react"

import { useState } from "react"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase-client-safe"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X } from "lucide-react"

interface ProfileImageUploadProps {
  currentPhotoURL?: string
  userId: string
  onUploadComplete: (url: string) => Promise<void>
}

export function ProfileImageUpload({ currentPhotoURL, userId, onUploadComplete }: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile || !userId) return

    try {
      setUploading(true)

      // Create a reference to the storage location
      const fileExtension = selectedFile.name.split(".").pop()
      const storageRef = ref(storage, `profile-images/${userId}_${Date.now()}.${fileExtension}`)

      // Upload the file
      await uploadBytes(storageRef, selectedFile)

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef)

      // Call the callback with the new URL
      await onUploadComplete(downloadURL)

      toast({
        title: "Profile image updated",
        description: "Your profile image has been updated successfully",
      })

      // Reset state
      setPreviewUrl(null)
      setSelectedFile(null)
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const cancelUpload = () => {
    setPreviewUrl(null)
    setSelectedFile(null)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={previewUrl || currentPhotoURL} alt="Profile" />
          <AvatarFallback className="text-lg">{currentPhotoURL ? "..." : getInitials(userId)}</AvatarFallback>
        </Avatar>

        {!previewUrl && (
          <div>
            <input
              type="file"
              id="profile-image"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <label htmlFor="profile-image">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Change Profile Picture
                </span>
              </Button>
            </label>
          </div>
        )}

        {previewUrl && (
          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Save Profile Picture"
              )}
            </Button>
            <Button variant="outline" onClick={cancelUpload} disabled={uploading}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
