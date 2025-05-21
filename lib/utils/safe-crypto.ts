/**
 * Safe Crypto Utility
 *
 * This utility provides a safe way to use crypto functions in both Node.js and browser environments.
 * It handles the differences between the environments and provides fallbacks when needed.
 */

// Type definitions for crypto operations
type HashAlgorithm = "sha1" | "sha256" | "sha512" | "md5"
type DigestFormat = "hex" | "base64" | "base64url"

// Interface for the safeCrypto object
export interface SafeCrypto {
  createHash: (data: string, algorithm?: HashAlgorithm, format?: DigestFormat) => Promise<string>
  randomBytes: (length: number) => Promise<Uint8Array>
  randomString: (length: number) => Promise<string>
  isCryptoAvailable: () => Promise<boolean>
}

/**
 * Create a hash of the given data
 */
async function createHash(
  data: string,
  algorithm: HashAlgorithm = "sha256",
  format: DigestFormat = "hex",
): Promise<string> {
  // Use the Web Crypto API if available (modern browsers)
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    try {
      // Convert algorithm name to the format expected by Web Crypto API
      const webCryptoAlgorithm = algorithm === "md5" ? "SHA-1" : algorithm.toUpperCase()

      // Encode the data as UTF-8
      const encoder = new TextEncoder()
      const data_buffer = encoder.encode(data)

      // Create the hash
      const hash_buffer = await window.crypto.subtle.digest(webCryptoAlgorithm, data_buffer)

      // Convert the hash to the requested format
      if (format === "hex") {
        return Array.from(new Uint8Array(hash_buffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
      } else if (format === "base64") {
        return btoa(String.fromCharCode(...new Uint8Array(hash_buffer)))
      } else if (format === "base64url") {
        return btoa(String.fromCharCode(...new Uint8Array(hash_buffer)))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "")
      }

      throw new Error(`Unsupported digest format: ${format}`)
    } catch (error) {
      console.warn("Web Crypto API failed, falling back to crypto-browserify", error)
      // Fall back to crypto-browserify
    }
  }

  // Fallback to crypto-browserify
  try {
    // Dynamic import to avoid bundling issues
    const crypto = await import("crypto")
    return crypto.createHash(algorithm).update(data).digest(format)
  } catch (error) {
    console.error("Crypto operations failed", error)
    throw new Error(`Crypto operation failed: ${error.message}`)
  }
}

/**
 * Generate random bytes
 */
async function randomBytes(length: number): Promise<Uint8Array> {
  // Use the Web Crypto API if available
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    try {
      const bytes = new Uint8Array(length)
      window.crypto.getRandomValues(bytes)
      return bytes
    } catch (error) {
      console.warn("Web Crypto API failed, falling back to crypto-browserify", error)
      // Fall back to crypto-browserify
    }
  }

  // Fallback to crypto-browserify
  try {
    const crypto = await import("crypto")
    const buffer = crypto.randomBytes(length)
    return new Uint8Array(buffer)
  } catch (error) {
    console.error("Random bytes generation failed", error)
    throw new Error(`Random bytes generation failed: ${error.message}`)
  }
}

/**
 * Generate a random string
 */
async function randomString(length: number): Promise<string> {
  const bytes = await randomBytes(length)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, length)
}

/**
 * Check if crypto is available
 */
async function isCryptoAvailable(): Promise<boolean> {
  try {
    // Try to use crypto
    await createHash("test")
    return true
  } catch (error) {
    return false
  }
}

// Create and export the safeCrypto object with all the utility functions
export const safeCrypto: SafeCrypto = {
  createHash,
  randomBytes,
  randomString,
  isCryptoAvailable,
}

// Also export individual functions for direct use
export { createHash, randomBytes, randomString, isCryptoAvailable }
