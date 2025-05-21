import { storage } from "@/lib/firebase-client-safe"
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  list,
  getMetadata,
  updateMetadata,
  type UploadTaskSnapshot,
} from "firebase/storage"
import { handleFirebaseError, retryOperation } from "@/lib/firebase-error-handler"
import { v4 as uuidv4 } from "uuid"

// Options for upload operations
export interface UploadOptions {
  maxRetries?: number
  initialDelayMs?: number
  metadata?: any
  generateUniqueName?: boolean
  onProgress?: (progress: number, snapshot: UploadTaskSnapshot) => void
}

// Options for download operations
export interface DownloadOptions {
  maxRetries?: number
  initialDelayMs?: number
}

// Options for delete operations
export interface DeleteOptions {
  maxRetries?: number
  initialDelayMs?: number
}

// Options for list operations
export interface ListOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxResults?: number
  pageToken?: string
}

/**
 * Storage wrapper with error handling
 */
export const storageWrapper = {
  /**
   * Upload a file
   */
  async uploadFile(
    path: string,
    file: File | Blob | Uint8Array | ArrayBuffer,
    options: UploadOptions = {},
  ): Promise<string> {
    const { maxRetries = 3, initialDelayMs = 1000, metadata = {}, generateUniqueName = true, onProgress } = options

    try {
      // Generate a unique file name if requested
      let filePath = path
      if (generateUniqueName) {
        const uniqueId = uuidv4()
        const extension = file instanceof File ? `.${file.name.split(".").pop()}` : ""
        filePath = `${path}${path.endsWith("/") ? "" : "/"}${uniqueId}${extension}`
      }

      const storageRef = ref(storage, filePath)

      // If progress callback is provided, use resumable upload
      if (onProgress) {
        return new Promise((resolve, reject) => {
          const uploadTask = uploadBytesResumable(storageRef, file, metadata)

          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              onProgress(progress, snapshot)
            },
            (error) => {
              reject(
                handleFirebaseError(error, {
                  operation: "upload-file-progress",
                  path: filePath,
                }),
              )
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
                resolve(downloadURL)
              } catch (error) {
                reject(
                  handleFirebaseError(error, {
                    operation: "get-download-url",
                    path: filePath,
                  }),
                )
              }
            },
          )
        })
      } else {
        // Use regular upload with retry
        return await retryOperation(
          async () => {
            const snapshot = await uploadBytes(storageRef, file, metadata)
            return await getDownloadURL(snapshot.ref)
          },
          maxRetries,
          initialDelayMs,
        )
      }
    } catch (error) {
      throw handleFirebaseError(error, {
        operation: "upload-file",
        path,
      })
    }
  },

  /**
   * Get download URL for a file
   */
  async getDownloadURL(path: string, options: DownloadOptions = {}): Promise<string> {
    const { maxRetries = 3, initialDelayMs = 1000 } = options

    try {
      return await retryOperation(
        async () => {
          const storageRef = ref(storage, path)
          return await getDownloadURL(storageRef)
        },
        maxRetries,
        initialDelayMs,
      )
    } catch (error) {
      throw handleFirebaseError(error, {
        operation: "get-download-url",
        path,
      })
    }
  },

  /**
   * Delete a file
   */
  async deleteFile(path: string, options: DeleteOptions = {}): Promise<void> {
    const { maxRetries = 3, initialDelayMs = 1000 } = options

    try {
      return await retryOperation(
        async () => {
          const storageRef = ref(storage, path)
          await deleteObject(storageRef)
        },
        maxRetries,
        initialDelayMs,
      )
    } catch (error) {
      throw handleFirebaseError(error, {
        operation: "delete-file",
        path,
      })
    }
  },

  /**
   * List all files in a directory
   */
  async listAll(path: string, options: ListOptions = {}): Promise<{ items: string[]; prefixes: string[] }> {
    const { maxRetries = 3, initialDelayMs = 1000 } = options

    try {
      return await retryOperation(
        async () => {
          const storageRef = ref(storage, path)
          const res = await listAll(storageRef)

          return {
            items: await Promise.all(
              res.items.map(async (itemRef) => {
                try {
                  return await getDownloadURL(itemRef)
                } catch (error) {
                  console.warn(`Failed to get download URL for ${itemRef.fullPath}:`, error)
                  return itemRef.fullPath
                }
              }),
            ),
            prefixes: res.prefixes.map((prefix) => prefix.fullPath),
          }
        },
        maxRetries,
        initialDelayMs,
      )
    } catch (error) {
      throw handleFirebaseError(error, {
        operation: "list-all",
        path,
      })
    }
  },

  /**
   * List files in a directory with pagination
   */
  async list(
    path: string,
    options: ListOptions = {},
  ): Promise<{ items: string[]; prefixes: string[]; nextPageToken?: string }> {
    const { maxRetries = 3, initialDelayMs = 1000, maxResults = 100, pageToken } = options

    try {
      return await retryOperation(
        async () => {
          const storageRef = ref(storage, path)
          const res = await list(storageRef, { maxResults, pageToken })

          return {
            items: await Promise.all(
              res.items.map(async (itemRef) => {
                try {
                  return await getDownloadURL(itemRef)
                } catch (error) {
                  console.warn(`Failed to get download URL for ${itemRef.fullPath}:`, error)
                  return itemRef.fullPath
                }
              }),
            ),
            prefixes: res.prefixes.map((prefix) => prefix.fullPath),
            nextPageToken: res.nextPageToken,
          }
        },
        maxRetries,
        initialDelayMs,
      )
    } catch (error) {
      throw handleFirebaseError(error, {
        operation: "list",
        path,
      })
    }
  },

  /**
   * Get metadata for a file
   */
  async getMetadata(path: string, options: DownloadOptions = {}): Promise<any> {
    const { maxRetries = 3, initialDelayMs = 1000 } = options

    try {
      return await retryOperation(
        async () => {
          const storageRef = ref(storage, path)
          return await getMetadata(storageRef)
        },
        maxRetries,
        initialDelayMs,
      )
    } catch (error) {
      throw handleFirebaseError(error, {
        operation: "get-metadata",
        path,
      })
    }
  },

  /**
   * Update metadata for a file
   */
  async updateMetadata(path: string, metadata: any, options: DownloadOptions = {}): Promise<any> {
    const { maxRetries = 3, initialDelayMs = 1000 } = options

    try {
      return await retryOperation(
        async () => {
          const storageRef = ref(storage, path)
          return await updateMetadata(storageRef, metadata)
        },
        maxRetries,
        initialDelayMs,
      )
    } catch (error) {
      throw handleFirebaseError(error, {
        operation: "update-metadata",
        path,
      })
    }
  },
}
