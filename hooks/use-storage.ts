"use client"

import { useState, useCallback } from "react"
import {
  storageWrapper,
  type UploadOptions,
  type DownloadOptions,
  type DeleteOptions,
  type ListOptions,
} from "@/lib/storage-wrapper"
import { useFirebaseError } from "./use-firebase-error"

export function useStorage(basePath = "") {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const { error, handleError, clearError } = useFirebaseError()

  // Normalize path
  const normalizePath = useCallback(
    (path: string) => {
      const normalizedBasePath = basePath.endsWith("/") ? basePath : `${basePath}/`
      const normalizedPath = path.startsWith("/") ? path.substring(1) : path
      return `${normalizedBasePath}${normalizedPath}`
    },
    [basePath],
  )

  // Upload a file
  const uploadFile = useCallback(
    async (
      path: string,
      file: File | Blob | Uint8Array | ArrayBuffer,
      options: Omit<UploadOptions, "onProgress"> = {},
    ) => {
      setLoading(true)
      setProgress(0)
      clearError()

      try {
        const fullPath = normalizePath(path)

        const url = await storageWrapper.uploadFile(fullPath, file, {
          ...options,
          onProgress: (progressValue, snapshot) => {
            setProgress(progressValue)
            options.onProgress?.(progressValue, snapshot)
          },
        })

        setProgress(100)
        return url
      } catch (err) {
        handleError(err, { operation: "upload-file", path })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [normalizePath, handleError, clearError],
  )

  // Get download URL
  const getDownloadURL = useCallback(
    async (path: string, options: DownloadOptions = {}) => {
      setLoading(true)
      clearError()

      try {
        const fullPath = normalizePath(path)
        return await storageWrapper.getDownloadURL(fullPath, options)
      } catch (err) {
        handleError(err, { operation: "get-download-url", path })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [normalizePath, handleError, clearError],
  )

  // Delete a file
  const deleteFile = useCallback(
    async (path: string, options: DeleteOptions = {}) => {
      setLoading(true)
      clearError()

      try {
        const fullPath = normalizePath(path)
        await storageWrapper.deleteFile(fullPath, options)
      } catch (err) {
        handleError(err, { operation: "delete-file", path })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [normalizePath, handleError, clearError],
  )

  // List all files in a directory
  const listAll = useCallback(
    async (path = "", options: ListOptions = {}) => {
      setLoading(true)
      clearError()

      try {
        const fullPath = normalizePath(path)
        return await storageWrapper.listAll(fullPath, options)
      } catch (err) {
        handleError(err, { operation: "list-all", path })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [normalizePath, handleError, clearError],
  )

  // List files in a directory with pagination
  const list = useCallback(
    async (path = "", options: ListOptions = {}) => {
      setLoading(true)
      clearError()

      try {
        const fullPath = normalizePath(path)
        return await storageWrapper.list(fullPath, options)
      } catch (err) {
        handleError(err, { operation: "list", path })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [normalizePath, handleError, clearError],
  )

  // Get metadata for a file
  const getMetadata = useCallback(
    async (path: string, options: DownloadOptions = {}) => {
      setLoading(true)
      clearError()

      try {
        const fullPath = normalizePath(path)
        return await storageWrapper.getMetadata(fullPath, options)
      } catch (err) {
        handleError(err, { operation: "get-metadata", path })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [normalizePath, handleError, clearError],
  )

  // Update metadata for a file
  const updateMetadata = useCallback(
    async (path: string, metadata: any, options: DownloadOptions = {}) => {
      setLoading(true)
      clearError()

      try {
        const fullPath = normalizePath(path)
        return await storageWrapper.updateMetadata(fullPath, metadata, options)
      } catch (err) {
        handleError(err, { operation: "update-metadata", path })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [normalizePath, handleError, clearError],
  )

  return {
    loading,
    progress,
    error,
    uploadFile,
    getDownloadURL,
    deleteFile,
    listAll,
    list,
    getMetadata,
    updateMetadata,
  }
}
