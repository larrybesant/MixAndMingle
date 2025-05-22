"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Upload, Loader2 } from "lucide-react"
import { uploadFile } from "@/lib/firebase/firebase-client"

interface FileUploaderProps {
  userId: string
  onUploadComplete?: (url: string, path: string) => void
  allowedTypes?: string[]
  maxSizeMB?: number
  folder?: string
}

export function FileUploader({
  userId,
  onUploadComplete,
  allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"],
  maxSizeMB = 5,
  folder = "uploads",
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)
    setSuccess(false)

    if (!selectedFile) return

    // Check file type
    if (!allowedTypes.includes(selectedFile.type)) {
      setError(`File type not allowed. Please upload: ${allowedTypes.join(", ")}`)
      return
    }

    // Check file size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSizeMB}MB`)
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file || !userId) return

    setUploading(true)
    setProgress(0)
    setError(null)
    setSuccess(false)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 100)

      // Upload using client-side method
      const path = `${folder}/${userId}/${Date.now()}_${file.name}`
      const url = await uploadFile(file, path)

      clearInterval(progressInterval)
      setProgress(100)
      setSuccess(true)
      setUploadedUrl(url)

      if (onUploadComplete) {
        onUploadComplete(url, path)
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload file")
    } finally {
      setUploading(false)
    }
  }

  const handleServerUpload = async () => {
    if (!file || !userId) return

    setUploading(true)
    setProgress(0)
    setError(null)
    setSuccess(false)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 100)

      // Create form data
      const formData = new FormData()
      formData.append("file", file)
      formData.append("userId", userId)

      // Upload using server-side API
      const response = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to upload file")
      }

      const data = await response.json()
      setProgress(100)
      setSuccess(true)
      setUploadedUrl(data.url)

      if (onUploadComplete) {
        onUploadComplete(data.url, data.path)
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload file")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <Input type="file" onChange={handleFileChange} disabled={uploading} accept={allowedTypes.join(",")} />
        <p className="text-xs text-muted-foreground">
          Allowed types: {allowedTypes.join(", ")} (Max size: {maxSizeMB}MB)
        </p>
      </div>

      {file && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {file.name} ({(file.size / (1024 * 1024)).toFixed(2)}MB)
          </p>

          <div className="flex space-x-2">
            <Button onClick={handleUpload} disabled={uploading || !file} className="flex-1">
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload (Client)
                </>
              )}
            </Button>

            <Button onClick={handleServerUpload} disabled={uploading || !file} className="flex-1" variant="outline">
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload (Server)
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">{progress}%</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && uploadedUrl && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Upload Successful</AlertTitle>
          <AlertDescription className="text-green-700">
            <p className="mb-2">File uploaded successfully!</p>
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {uploadedUrl}
            </a>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
