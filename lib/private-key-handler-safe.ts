// This file should only be imported in server components or API routes
export function getPrivateKey(): string {
  // First try to get the key directly from the environment variable
  let privateKey = process.env.FIREBASE_PRIVATE_KEY

  // If it's base64 encoded, decode it
  if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
    try {
      // Only run this on the server
      if (typeof window === "undefined") {
        const Buffer = require("buffer").Buffer
        privateKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, "base64").toString("utf8")
      }
    } catch (error) {
      console.error("Error decoding private key from base64:", error)
    }
  }

  // Replace escaped newlines with actual newlines
  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n")
  }

  if (!privateKey) {
    console.warn("Firebase private key not found in environment variables")
    return "dummy-key-for-development"
  }

  return privateKey
}

export function isBuildEnvironment(): boolean {
  return process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production"
}
