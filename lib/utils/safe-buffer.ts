/**
 * Safe buffer utility that works in both Node.js and browser environments
 */

interface SafeBufferUtils {
  fromString: (text: string, encoding?: string) => Uint8Array
  toString: (buffer: Uint8Array, encoding?: string) => string
  concat: (buffers: Uint8Array[]) => Uint8Array
  isBuffer: (obj: any) => boolean
}

// Import BufferEncoding type from 'buffer' module
import type { BufferEncoding } from "buffer"

/**
 * Creates a safe buffer utility that works in both Node.js and browser environments
 */
export const createSafeBuffer = (): SafeBufferUtils => {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined"

  /**
   * Creates a buffer from a string
   */
  const fromString = (text: string, encoding = "utf-8"): Uint8Array => {
    if (isBrowser) {
      // Browser implementation
      if (encoding === "base64") {
        // Convert base64 to binary string
        const binaryString = atob(text)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        return bytes
      } else if (encoding === "hex") {
        // Convert hex to bytes
        const bytes = new Uint8Array(text.length / 2)
        for (let i = 0; i < text.length; i += 2) {
          bytes[i / 2] = Number.parseInt(text.substring(i, i + 2), 16)
        }
        return bytes
      } else {
        // Default to UTF-8
        return new TextEncoder().encode(text)
      }
    } else {
      // Node.js implementation
      try {
        const Buffer = require("buffer").Buffer
        return Buffer.from(text, encoding as BufferEncoding)
      } catch (error) {
        console.error(`Node.js Buffer.from error: ${error}`)
        // Fallback to browser implementation
        return new TextEncoder().encode(text)
      }
    }
  }

  /**
   * Converts a buffer to a string
   */
  const toString = (buffer: Uint8Array, encoding = "utf-8"): string => {
    if (isBrowser) {
      // Browser implementation
      if (encoding === "base64") {
        // Convert bytes to base64
        let binary = ""
        const bytes = new Uint8Array(buffer)
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i])
        }
        return btoa(binary)
      } else if (encoding === "hex") {
        // Convert bytes to hex
        return Array.from(buffer)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
      } else {
        // Default to UTF-8
        return new TextDecoder().decode(buffer)
      }
    } else {
      // Node.js implementation
      try {
        const Buffer = require("buffer").Buffer
        return Buffer.from(buffer).toString(encoding as BufferEncoding)
      } catch (error) {
        console.error(`Node.js Buffer.toString error: ${error}`)
        // Fallback to browser implementation
        return new TextDecoder().decode(buffer)
      }
    }
  }

  /**
   * Concatenates multiple buffers
   */
  const concat = (buffers: Uint8Array[]): Uint8Array => {
    if (isBrowser) {
      // Browser implementation
      const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0)
      const result = new Uint8Array(totalLength)
      let offset = 0
      for (const buf of buffers) {
        result.set(buf, offset)
        offset += buf.length
      }
      return result
    } else {
      // Node.js implementation
      try {
        const Buffer = require("buffer").Buffer
        return Buffer.concat(buffers)
      } catch (error) {
        console.error(`Node.js Buffer.concat error: ${error}`)
        // Fallback to browser implementation
        const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0)
        const result = new Uint8Array(totalLength)
        let offset = 0
        for (const buf of buffers) {
          result.set(buf, offset)
          offset += buf.length
        }
        return result
      }
    }
  }

  /**
   * Checks if an object is a buffer
   */
  const isBuffer = (obj: any): boolean => {
    if (isBrowser) {
      // Browser implementation
      return obj instanceof Uint8Array
    } else {
      // Node.js implementation
      try {
        const Buffer = require("buffer").Buffer
        return Buffer.isBuffer(obj)
      } catch (error) {
        console.error(`Node.js Buffer.isBuffer error: ${error}`)
        // Fallback to browser implementation
        return obj instanceof Uint8Array
      }
    }
  }

  return {
    fromString,
    toString,
    concat,
    isBuffer,
  }
}

// Export a singleton instance for convenience
export const safeBuffer = createSafeBuffer()

// Example usage:
// const buffer = safeBuffer.fromString('hello world');
// const base64 = safeBuffer.toString(buffer, 'base64');
// const combined = safeBuffer.concat([buffer, buffer]);
