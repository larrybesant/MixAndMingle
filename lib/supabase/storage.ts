import { createClient } from "@/lib/supabase/client"

// File size limit in bytes (5MB)
const FILE_SIZE_LIMIT = 5 * 1024 * 1024

// Allowed file types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]

export type UploadResult = {
  success: boolean
  error?: string
  url?: string
  path?: string
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(file: File, bucket: string, folder: string, userId: string): Promise<UploadResult> {
  try {
    // Validate file size
    if (file.size > FILE_SIZE_LIMIT) {
      return {
        success: false,
        error: `File size exceeds the ${FILE_SIZE_LIMIT / 1024 / 1024}MB limit`,
      }
    }

    // Validate file type for images
    if (bucket === "images" && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.",
      }
    }

    // Create a unique file path
    const timestamp = new Date().getTime()
    const fileExt = file.name.split(".").pop()
    const filePath = `${folder}/${userId}_${timestamp}.${fileExt}`

    // Upload the file
    const supabase = createClient()
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Error uploading file:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    }
  } catch (error: any) {
    console.error("Error in uploadFile:", error.message)
    return {
      success: false,
      error: "An unexpected error occurred during file upload",
    }
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: string, filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    }
  }
}
