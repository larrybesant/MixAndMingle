"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadFile, type UploadResult } from "@/lib/supabase/storage"
import { Loader2, Upload, X } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import Image from "next/image"

interface FileUploadProps {
  bucket: string
  folder: string
  onUploadComplete: (result: UploadResult) => void
  accept?: string
  maxSizeMB?: number
  className?: string
  buttonText?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
}

export function FileUpload({
  bucket,
  folder,
  onUploadComplete,
  accept = "image/*",
  maxSizeMB = 5,
  className = "",
  buttonText = "Upload File",
  variant = "outline",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Clear previous errors and preview
    setError(null)
    setPreview(null)

    // Check file size
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds the ${maxSizeMB}MB limit`)
      return
    }

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }

    // Upload the file
    setIsUploading(true)
    try {
      if (!user) {
        throw new Error("You must be logged in to upload files")
      }

      const result = await uploadFile(file, bucket, folder, user.id)

      if (!result.success) {
        setError(result.error || "Upload failed")
        return
      }

      onUploadComplete(result)
    } catch (err: any) {
      setError(err.message || "An error occurred during upload")
    } finally {
      setIsUploading(false)
    }
  }

  const clearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setPreview(null)
    setError(null)
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        <Label htmlFor="file-upload">{buttonText}</Label>
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
          <Button
            type="button"
            variant={variant}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {buttonText}
              </>
            )}
          </Button>
        </div>

        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

        {preview && (
          <div className="relative mt-2">
            <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-md">
              <Image src={preview || "/placeholder.svg"} alt="File preview" fill className="object-cover" />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={clearFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
