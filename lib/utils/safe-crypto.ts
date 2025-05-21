// Define types for our safe crypto functions
type HashAlgorithm = "sha1" | "sha256" | "sha512" | "md5"

interface SafeCryptoUtils {
  createHash: (algorithm: HashAlgorithm, data: string | Uint8Array) => Promise<string>
  randomBytes: (size: number) => Promise<Uint8Array>
  generateRandomString: (length: number) => Promise<string>
}

/**
 * Creates a safe crypto utility that works in both Node.js and browser environments
 */
export const createSafeCrypto = (): SafeCryptoUtils => {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined"

  /**
   * Creates a hash using the specified algorithm
   */
  const createHash = async (algorithm: HashAlgorithm, data: string | Uint8Array): Promise<string> => {
    if (isBrowser) {
      // Use Web Crypto API in the browser
      const encoder = new TextEncoder()
      const dataBuffer = typeof data === "string" ? encoder.encode(data) : data

      // Map Node.js hash algorithm names to Web Crypto API algorithm names
      const algorithmMap: Record<HashAlgorithm, AlgorithmIdentifier> = {
        sha1: "SHA-1",
        sha256: "SHA-256",
        sha512: "SHA-512",
        md5: "MD5", // Note: MD5 might not be supported in all browsers
      }

      try {
        const hashBuffer = await crypto.subtle.digest(algorithmMap[algorithm], dataBuffer)
        return Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
      } catch (error) {
        console.error(`Web Crypto API error: ${error}`)
        throw new Error(`Hashing failed: ${error}`)
      }
    } else {
      // Use Node.js crypto in server environment
      try {
        // Dynamic import to avoid bundling issues
        const crypto = await import("crypto")
        const hash = crypto.createHash(algorithm)
        hash.update(data)
        return hash.digest("hex")
      } catch (error) {
        console.error(`Node.js crypto error: ${error}`)
        throw new Error(`Hashing failed: ${error}`)
      }
    }
  }

  /**
   * Generates random bytes
   */
  const randomBytes = async (size: number): Promise<Uint8Array> => {
    if (isBrowser) {
      // Use Web Crypto API in the browser
      const array = new Uint8Array(size)
      crypto.getRandomValues(array)
      return array
    } else {
      // Use Node.js crypto in server environment
      try {
        const crypto = await import("crypto")
        const buffer = crypto.randomBytes(size)
        return new Uint8Array(buffer)
      } catch (error) {
        console.error(`Node.js randomBytes error: ${error}`)
        throw new Error(`Random bytes generation failed: ${error}`)
      }
    }
  }

  /**
   * Generates a random string of specified length
   */
  const generateRandomString = async (length: number): Promise<string> => {
    const bytes = await randomBytes(Math.ceil(length * 0.75))
    return btoa(String.fromCharCode(...bytes))
      .replace(/[+/]/g, "")
      .substring(0, length)
  }

  return {
    createHash,
    randomBytes,
    generateRandomString,
  }
}

// Export a singleton instance for convenience
export const safeCrypto = createSafeCrypto()

// Example usage:
// const hash = await safeCrypto.createHash('sha256', 'hello world');
// const randomBytes = await safeCrypto.randomBytes(16);
// const randomString = await safeCrypto.generateRandomString(32);
