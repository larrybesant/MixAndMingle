/**
 * Safe path utility that works in both Node.js and browser environments
 */

interface SafePathUtils {
  join: (...paths: string[]) => string
  basename: (path: string, ext?: string) => string
  dirname: (path: string) => string
  extname: (path: string) => string
  normalize: (path: string) => string
  isAbsolute: (path: string) => boolean
}

/**
 * Creates a safe path utility that works in both Node.js and browser environments
 */
export const createSafePath = (): SafePathUtils => {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined"

  // Simple path separator detection
  const isWindows = isBrowser ? navigator.platform.indexOf("Win") > -1 : process.platform === "win32"
  const sep = isWindows ? "\\" : "/"

  /**
   * Joins path segments
   */
  const join = (...paths: string[]): string => {
    if (isBrowser) {
      // Simple browser implementation
      return paths
        .filter(Boolean)
        .join(sep)
        .replace(new RegExp(`${sep}+`, "g"), sep)
    } else {
      // Use Node.js path in server environment
      try {
        // Dynamic import to avoid bundling issues
        const path = require("path")
        return path.join(...paths)
      } catch (error) {
        console.error(`Node.js path.join error: ${error}`)
        // Fallback to simple implementation
        return paths
          .filter(Boolean)
          .join(sep)
          .replace(new RegExp(`${sep}+`, "g"), sep)
      }
    }
  }

  /**
   * Gets the base name of a path
   */
  const basename = (path: string, ext?: string): string => {
    if (isBrowser) {
      // Simple browser implementation
      const base = path.split(/[\\/]/).pop() || ""
      return ext && base.endsWith(ext) ? base.slice(0, -ext.length) : base
    } else {
      // Use Node.js path in server environment
      try {
        const path_module = require("path")
        return path_module.basename(path, ext)
      } catch (error) {
        // Fallback to simple implementation
        const base = path.split(/[\\/]/).pop() || ""
        return ext && base.endsWith(ext) ? base.slice(0, -ext.length) : base
      }
    }
  }

  /**
   * Gets the directory name of a path
   */
  const dirname = (path: string): string => {
    if (isBrowser) {
      // Simple browser implementation
      const segments = path.split(/[\\/]/)
      segments.pop()
      return segments.join(sep) || "."
    } else {
      // Use Node.js path in server environment
      try {
        const path_module = require("path")
        return path_module.dirname(path)
      } catch (error) {
        // Fallback to simple implementation
        const segments = path.split(/[\\/]/)
        segments.pop()
        return segments.join(sep) || "."
      }
    }
  }

  /**
   * Gets the extension of a path
   */
  const extname = (path: string): string => {
    if (isBrowser) {
      // Simple browser implementation
      const match = path.match(/\.[^./\\]*$/)
      return match ? match[0] : ""
    } else {
      // Use Node.js path in server environment
      try {
        const path_module = require("path")
        return path_module.extname(path)
      } catch (error) {
        // Fallback to simple implementation
        const match = path.match(/\.[^./\\]*$/)
        return match ? match[0] : ""
      }
    }
  }

  /**
   * Normalizes a path
   */
  const normalize = (path: string): string => {
    if (isBrowser) {
      // Simple browser implementation
      return path.replace(/[\\/]+/g, sep).replace(/\.$/, "")
    } else {
      // Use Node.js path in server environment
      try {
        const path_module = require("path")
        return path_module.normalize(path)
      } catch (error) {
        // Fallback to simple implementation
        return path.replace(/[\\/]+/g, sep).replace(/\.$/, "")
      }
    }
  }

  /**
   * Checks if a path is absolute
   */
  const isAbsolute = (path: string): boolean => {
    if (isBrowser) {
      // Simple browser implementation
      return /^([a-z]:)?[\\/]/i.test(path)
    } else {
      // Use Node.js path in server environment
      try {
        const path_module = require("path")
        return path_module.isAbsolute(path)
      } catch (error) {
        // Fallback to simple implementation
        return /^([a-z]:)?[\\/]/i.test(path)
      }
    }
  }

  return {
    join,
    basename,
    dirname,
    extname,
    normalize,
    isAbsolute,
  }
}

// Export a singleton instance for convenience
export const safePath = createSafePath()

// Example usage:
// const fullPath = safePath.join('directory', 'file.txt');
// const fileName = safePath.basename(fullPath);
// const extension = safePath.extname(fullPath);
