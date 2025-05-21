/**
 * Utility functions for environment detection
 */

// Check if code is running in a browser environment
export const isBrowser = typeof window !== "undefined"

// Check if code is running on the server
export const isServer = !isBrowser

// Check if we're in development mode
export const isDevelopment = process.env.NODE_ENV === "development"

// Check if we're in production mode
export const isProduction = process.env.NODE_ENV === "production"

// Safe window access
export const getWindow = () => (isBrowser ? window : undefined)

// Safe document access
export const getDocument = () => (isBrowser ? document : undefined)

// Safe localStorage access
export const getLocalStorage = () => {
  if (isBrowser) {
    try {
      return localStorage
    } catch (e) {
      console.warn("localStorage is not available:", e)
      return null
    }
  }
  return null
}

// Safe sessionStorage access
export const getSessionStorage = () => {
  if (isBrowser) {
    try {
      return sessionStorage
    } catch (e) {
      console.warn("sessionStorage is not available:", e)
      return null
    }
  }
  return null
}
