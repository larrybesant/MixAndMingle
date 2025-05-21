"use client"

import { useState, useEffect } from "react"

// Custom hook for lazy loading images
export function useLazyImage(src: string, placeholder: string) {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    // Create a new image object
    const img = new Image()

    // Set up load event handler
    img.onload = () => {
      setImageSrc(src)
      setImageLoaded(true)
    }

    // Start loading the image
    img.src = src

    // Cleanup
    return () => {
      img.onload = null
    }
  }, [src])

  return { imageSrc, imageLoaded }
}

// Function to get optimized image dimensions
export function getOptimizedImageDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth = 1200,
  maxHeight = 800,
) {
  // If image is already smaller than max dimensions, return original
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight }
  }

  // Calculate aspect ratio
  const aspectRatio = originalWidth / originalHeight

  // Calculate new dimensions while maintaining aspect ratio
  let newWidth = maxWidth
  let newHeight = maxWidth / aspectRatio

  // If height is still too large, adjust based on height
  if (newHeight > maxHeight) {
    newHeight = maxHeight
    newWidth = maxHeight * aspectRatio
  }

  return { width: Math.round(newWidth), height: Math.round(newHeight) }
}

// Function to create responsive image srcset
export function createSrcSet(basePath: string, extension: string, widths: number[] = [320, 640, 960, 1280, 1920]) {
  return widths.map((width) => `${basePath}-${width}.${extension} ${width}w`).join(", ")
}
