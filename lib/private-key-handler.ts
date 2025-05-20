/**
 * This module is dedicated to handling the Firebase private key
 * with detailed error handling and logging.
 */

// Function to get the private key with detailed error handling
export function getPrivateKey(): string {
  try {
    // First, try to use the base64 encoded key (recommended approach)
    if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
      try {
        // Decode the base64 string
        const decoded = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, "base64").toString("utf8")

        // Verify the decoded key has the expected format
        if (decoded.includes("-----BEGIN PRIVATE KEY-----") && decoded.includes("-----END PRIVATE KEY-----")) {
          console.log("Successfully decoded private key from base64")
          return decoded
        } else {
          console.warn("Decoded base64 key doesn't have the expected PEM format")
        }
      } catch (e) {
        console.error("Failed to decode base64 private key:", e)
      }
    }

    // Fall back to the regular private key environment variable
    const rawKey = process.env.FIREBASE_PRIVATE_KEY

    if (!rawKey) {
      console.error("No private key found in environment variables")
      // Return a dummy key for build process
      return "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\n-----END PRIVATE KEY-----\n"
    }

    // If the key already has the correct format with newlines
    if (
      rawKey.includes("\n") &&
      rawKey.includes("-----BEGIN PRIVATE KEY-----") &&
      rawKey.includes("-----END PRIVATE KEY-----")
    ) {
      console.log("Using private key with proper PEM format")
      return rawKey
    }

    // If the key has escaped newlines (\\n)
    if (rawKey.includes("\\n")) {
      const formattedKey = rawKey.replace(/\\n/g, "\n")
      console.log("Converted escaped newlines in private key")
      return formattedKey
    }

    // If the key is just the raw key without headers/footers
    if (!rawKey.includes("-----BEGIN PRIVATE KEY-----")) {
      const formattedKey = `-----BEGIN PRIVATE KEY-----\n${rawKey}\n-----END PRIVATE KEY-----\n`
      console.log("Added PEM headers to private key")
      return formattedKey
    }

    // Last resort: return as is
    console.log("Using private key as-is")
    return rawKey
  } catch (error) {
    console.error("Error processing private key:", error)
    // Return a dummy key for build process
    return "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\n-----END PRIVATE KEY-----\n"
  }
}

// Function to check if we're in a build environment
export function isBuildEnvironment(): boolean {
  return process.env.NODE_ENV === "production" && !process.env.VERCEL_URL
}
