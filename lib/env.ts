// Environment variable handler
export const env = {
  // Firebase configuration (server-side only)
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Handle private key with special care
    get privateKey(): string {
      // For local development with .env files
      const rawKey = process.env.FIREBASE_PRIVATE_KEY

      if (!rawKey && !process.env.FIREBASE_PRIVATE_KEY_BASE64) {
        throw new Error("FIREBASE_PRIVATE_KEY or FIREBASE_PRIVATE_KEY_BASE64 environment variable is not set")
      }

      // If the key is base64 encoded (a common workaround)
      if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
        try {
          const decoded = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, "base64").toString("utf8")
          return decoded
        } catch (e) {
          console.error("Failed to decode base64 private key:", e)
        }
      }

      // If the key is already properly formatted with newlines
      if (rawKey && rawKey.includes("\n") && rawKey.includes("-----BEGIN PRIVATE KEY-----")) {
        return rawKey
      }

      // If the key has escaped newlines (\\n)
      if (rawKey && rawKey.includes("\\n")) {
        return rawKey.replace(/\\n/g, "\n")
      }

      // If the key is just the raw key without headers/footers
      if (rawKey && !rawKey.includes("-----BEGIN PRIVATE KEY-----")) {
        return `-----BEGIN PRIVATE KEY-----\n${rawKey}\n-----END PRIVATE KEY-----\n`
      }

      // Last resort: return as is and hope for the best
      return rawKey || ""
    },
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    // VAPID key removed completely
  },

  // Public Firebase configuration (safe for client-side)
  publicFirebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },

  // Development mode check
  isDevelopment: process.env.NODE_ENV === "development",
}
