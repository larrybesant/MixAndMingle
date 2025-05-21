/**
 * Safe stream utility that works in both Node.js and browser environments
 * This is a simplified implementation focused on common use cases
 */

// Define event types
type DataHandler = (chunk: Uint8Array) => void
type ErrorHandler = (error: Error) => void
type EndHandler = () => void

interface SafeReadableStream {
  on: (event: "data" | "error" | "end", handler: DataHandler | ErrorHandler | EndHandler) => SafeReadableStream
  pipe: (destination: SafeWritableStream) => SafeWritableStream
  read: () => Uint8Array | null
}

interface SafeWritableStream {
  write: (chunk: Uint8Array | string) => boolean
  end: (chunk?: Uint8Array | string) => void
  on: (event: "finish" | "error", handler: EndHandler | ErrorHandler) => SafeWritableStream
}

interface SafeStreamUtils {
  createReadableStream: (data?: Uint8Array | string) => SafeReadableStream
  createWritableStream: (onWrite?: (chunk: Uint8Array) => void, onFinish?: () => void) => SafeWritableStream
  pipeline: (source: SafeReadableStream, destination: SafeWritableStream) => Promise<void>
}

/**
 * Creates a safe stream utility that works in both Node.js and browser environments
 */
export const createSafeStream = (): SafeStreamUtils => {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined"

  /**
   * Creates a readable stream
   */
  const createReadableStream = (data?: Uint8Array | string): SafeReadableStream => {
    if (isBrowser) {
      // Browser implementation using a simple event emitter pattern
      const dataHandlers: DataHandler[] = []
      const errorHandlers: ErrorHandler[] = []
      const endHandlers: EndHandler[] = []

      let buffer: Uint8Array | null = null

      if (data) {
        if (typeof data === "string") {
          buffer = new TextEncoder().encode(data)
        } else {
          buffer = data
        }
      }

      // Simple implementation of a readable stream
      const stream: SafeReadableStream = {
        on: (event, handler) => {
          if (event === "data") {
            dataHandlers.push(handler as DataHandler)
            // If we have data, emit it immediately
            if (buffer) {
              setTimeout(() => {
                dataHandlers.forEach((h) => h(buffer!))
                endHandlers.forEach((h) => h())
              }, 0)
            }
          } else if (event === "error") {
            errorHandlers.push(handler as ErrorHandler)
          } else if (event === "end") {
            endHandlers.push(handler as EndHandler)
            // If we have data, emit end after data
            if (buffer) {
              setTimeout(() => {
                endHandlers.forEach((h) => h())
              }, 0)
            }
          }
          return stream
        },
        pipe: (destination) => {
          stream.on("data", (chunk) => {
            destination.write(chunk)
          })
          stream.on("end", () => {
            destination.end()
          })
          return destination
        },
        read: () => {
          const temp = buffer
          buffer = null
          return temp
        },
      }

      return stream
    } else {
      // Node.js implementation
      try {
        const { Readable } = require("stream")

        if (data) {
          return Readable.from(data)
        } else {
          return new Readable({
            read() {},
          })
        }
      } catch (error) {
        console.error(`Node.js stream error: ${error}`)
        // Fallback to browser implementation
        return createReadableStream(data)
      }
    }
  }

  /**
   * Creates a writable stream
   */
  const createWritableStream = (onWrite?: (chunk: Uint8Array) => void, onFinish?: () => void): SafeWritableStream => {
    if (isBrowser) {
      // Browser implementation
      const chunks: Uint8Array[] = []
      const errorHandlers: ErrorHandler[] = []
      const finishHandlers: EndHandler[] = []

      if (onFinish) {
        finishHandlers.push(onFinish)
      }

      // Simple implementation of a writable stream
      const stream: SafeWritableStream = {
        write: (chunk) => {
          let buffer: Uint8Array

          if (typeof chunk === "string") {
            buffer = new TextEncoder().encode(chunk)
          } else {
            buffer = chunk
          }

          chunks.push(buffer)

          if (onWrite) {
            onWrite(buffer)
          }

          return true
        },
        end: (chunk) => {
          if (chunk) {
            stream.write(chunk)
          }

          // Call all finish handlers
          setTimeout(() => {
            finishHandlers.forEach((h) => h())
          }, 0)
        },
        on: (event, handler) => {
          if (event === "finish") {
            finishHandlers.push(handler as EndHandler)
          } else if (event === "error") {
            errorHandlers.push(handler as ErrorHandler)
          }
          return stream
        },
      }

      return stream
    } else {
      // Node.js implementation
      try {
        const { Writable } = require("stream")

        return new Writable({
          write(chunk, encoding, callback) {
            if (onWrite) {
              onWrite(chunk)
            }
            callback()
          },
          final(callback) {
            if (onFinish) {
              onFinish()
            }
            callback()
          },
        })
      } catch (error) {
        console.error(`Node.js stream error: ${error}`)
        // Fallback to browser implementation
        return createWritableStream(onWrite, onFinish)
      }
    }
  }

  /**
   * Pipes data from a source stream to a destination stream
   */
  const pipeline = async (source: SafeReadableStream, destination: SafeWritableStream): Promise<void> => {
    return new Promise((resolve, reject) => {
      source.on("error", reject)
      destination.on("error", reject)

      source.pipe(destination)

      destination.on("finish", resolve)
    })
  }

  return {
    createReadableStream,
    createWritableStream,
    pipeline,
  }
}

// Export a singleton instance for convenience
export const safeStream = createSafeStream()

// Example usage:
// const readableStream = safeStream.createReadableStream('hello world');
// const writableStream = safeStream.createWritableStream(
//   chunk => console.log('Received chunk:', new TextDecoder().decode(chunk)),
//   () => console.log('Stream finished')
// );
// safeStream.pipeline(readableStream, writableStream).then(() => console.log('Pipeline complete'));
