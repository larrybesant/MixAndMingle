import { initializeFirebaseAdmin } from "./firebase-admin"
import { getFirebaseStorage } from "./firebase-client"
import { ref, getDownloadURL, deleteObject, listAll } from "firebase/storage"

/**
 * Get a download URL for a file in Firebase Storage (server-side)
 */
export async function getFileUrl(filePath: string): Promise<string> {
  try {
    const { storage } = initializeFirebaseAdmin()
    const bucket = storage.bucket()
    const file = bucket.file(filePath)

    const [exists] = await file.exists()
    if (!exists) {
      throw new Error(`File ${filePath} does not exist`)
    }

    const [url] = await file.getSignedUrl({
      action: "read",
      expires: "03-01-2500", // Far future expiration
    })

    return url
  } catch (error) {
    console.error(`Error getting URL for ${filePath}:`, error)
    throw error
  }
}

/**
 * Delete a file from Firebase Storage (server-side)
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const { storage } = initializeFirebaseAdmin()
    const bucket = storage.bucket()
    const file = bucket.file(filePath)

    const [exists] = await file.exists()
    if (!exists) {
      throw new Error(`File ${filePath} does not exist`)
    }

    await file.delete()
  } catch (error) {
    console.error(`Error deleting ${filePath}:`, error)
    throw error
  }
}

/**
 * List all files in a directory (client-side)
 */
export async function listFiles(directory: string): Promise<{ name: string; url: string }[]> {
  try {
    const storage = getFirebaseStorage()
    const directoryRef = ref(storage, directory)

    const result = await listAll(directoryRef)

    const files = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef)
        return {
          name: itemRef.name,
          url,
        }
      }),
    )

    return files
  } catch (error) {
    console.error(`Error listing files in ${directory}:`, error)
    throw error
  }
}

/**
 * Get a download URL for a file in Firebase Storage (client-side)
 */
export async function getFileUrlClient(filePath: string): Promise<string> {
  try {
    const storage = getFirebaseStorage()
    const fileRef = ref(storage, filePath)
    return await getDownloadURL(fileRef)
  } catch (error) {
    console.error(`Error getting URL for ${filePath}:`, error)
    throw error
  }
}

/**
 * Delete a file from Firebase Storage (client-side)
 */
export async function deleteFileClient(filePath: string): Promise<void> {
  try {
    const storage = getFirebaseStorage()
    const fileRef = ref(storage, filePath)
    await deleteObject(fileRef)
  } catch (error) {
    console.error(`Error deleting ${filePath}:`, error)
    throw error
  }
}
