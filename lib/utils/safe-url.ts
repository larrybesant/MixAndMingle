/**
 * Safe URL utility that works in both Node.js and browser environments
 */

interface UrlComponents {
  protocol: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  username: string
  password: string
  origin: string
  href: string
}

interface SafeUrlUtils {
  parse: (url: string) => UrlComponents
  format: (urlObj: Partial<UrlComponents>) => string
  resolve: (from: string, to: string) => string
  isAbsolute: (url: string) => boolean
}

/**
 * Creates a safe URL utility that works in both Node.js and browser environments
 */
export const createSafeUrl = (): SafeUrlUtils => {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined"

  /**
   * Parses a URL string into components
   */
  const parse = (url: string): UrlComponents => {
    if (isBrowser) {
      // Browser implementation using URL API
      try {
        const parsedUrl = new URL(url, window.location.origin)
        return {
          protocol: parsedUrl.protocol.replace(/:$/, ""),
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          pathname: parsedUrl.pathname,
          search: parsedUrl.search,
          hash: parsedUrl.hash,
          username: parsedUrl.username,
          password: parsedUrl.password,
          origin: parsedUrl.origin,
          href: parsedUrl.href,
        }
      } catch (error) {
        console.error(`URL parsing error: ${error}`)
        // Return empty components on error
        return {
          protocol: "",
          hostname: "",
          port: "",
          pathname: "",
          search: "",
          hash: "",
          username: "",
          password: "",
          origin: "",
          href: url,
        }
      }
    } else {
      // Node.js implementation
      try {
        const URL = require("url").URL
        const parsedUrl = new URL(url)
        return {
          protocol: parsedUrl.protocol.replace(/:$/, ""),
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          pathname: parsedUrl.pathname,
          search: parsedUrl.search,
          hash: parsedUrl.hash,
          username: parsedUrl.username,
          password: parsedUrl.password,
          origin: parsedUrl.origin,
          href: parsedUrl.href,
        }
      } catch (error) {
        console.error(`Node.js URL parsing error: ${error}`)
        // Fallback to browser implementation or return empty components
        return {
          protocol: "",
          hostname: "",
          port: "",
          pathname: "",
          search: "",
          hash: "",
          username: "",
          password: "",
          origin: "",
          href: url,
        }
      }
    }
  }

  /**
   * Formats URL components into a URL string
   */
  const format = (urlObj: Partial<UrlComponents>): string => {
    if (isBrowser) {
      // Browser implementation
      try {
        const url = new URL("http://placeholder")

        if (urlObj.protocol) url.protocol = urlObj.protocol
        if (urlObj.hostname) url.hostname = urlObj.hostname
        if (urlObj.port) url.port = urlObj.port
        if (urlObj.pathname) url.pathname = urlObj.pathname
        if (urlObj.search) url.search = urlObj.search
        if (urlObj.hash) url.hash = urlObj.hash
        if (urlObj.username) url.username = urlObj.username
        if (urlObj.password) url.password = urlObj.password

        return url.href
      } catch (error) {
        console.error(`URL formatting error: ${error}`)
        // Simple fallback
        return urlObj.href || ""
      }
    } else {
      // Node.js implementation
      try {
        const { format } = require("url")
        return format(urlObj)
      } catch (error) {
        console.error(`Node.js URL formatting error: ${error}`)
        // Fallback to simple string concatenation
        const protocol = urlObj.protocol ? `${urlObj.protocol}://` : ""
        const auth = urlObj.username ? `${urlObj.username}${urlObj.password ? `:${urlObj.password}` : ""}@` : ""
        const host = urlObj.hostname || ""
        const port = urlObj.port ? `:${urlObj.port}` : ""
        const pathname = urlObj.pathname || ""
        const search = urlObj.search || ""
        const hash = urlObj.hash || ""

        return `${protocol}${auth}${host}${port}${pathname}${search}${hash}`
      }
    }
  }

  /**
   * Resolves a relative URL against a base URL
   */
  const resolve = (from: string, to: string): string => {
    if (isBrowser) {
      // Browser implementation
      try {
        return new URL(to, from).href
      } catch (error) {
        console.error(`URL resolve error: ${error}`)
        return to
      }
    } else {
      // Node.js implementation
      try {
        const { resolve } = require("url")
        return resolve(from, to)
      } catch (error) {
        console.error(`Node.js URL resolve error: ${error}`)
        // Fallback to browser implementation
        try {
          return new URL(to, from).href
        } catch {
          return to
        }
      }
    }
  }

  /**
   * Checks if a URL is absolute
   */
  const isAbsolute = (url: string): boolean => {
    return /^[a-z][a-z0-9+.-]*:/i.test(url)
  }

  return {
    parse,
    format,
    resolve,
    isAbsolute,
  }
}

// Export a singleton instance for convenience
export const safeUrl = createSafeUrl()

// Example usage:
// const parsed = safeUrl.parse('https://example.com/path?query=value#hash');
// const formatted = safeUrl.format({ protocol: 'https', hostname: 'example.com' });
// const resolved = safeUrl.resolve('https://example.com', '/relative/path');
