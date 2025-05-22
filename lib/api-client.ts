import { API_URL } from "@/app/config"

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  headers?: Record<string, string>
  body?: any
  cache?: RequestCache
  credentials?: RequestCredentials
  next?: { revalidate?: number | false }
  timeout?: number
}

/**
 * Enhanced fetch function with timeout and error handling
 */
export async function fetchWithTimeout(url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeout = 8000, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API error: ${response.status}`)
    }

    return response
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeout}ms`)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Fetches data from an API endpoint with proper error handling
 */
export async function fetchApi<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { method = "GET", headers = {}, body, ...restOptions } = options

  // Set default headers
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  }

  // Prepare request options
  const requestOptions: RequestInit = {
    method,
    headers: defaultHeaders,
    ...restOptions,
  }

  // Add body if provided (and stringify if it's an object)
  if (body) {
    requestOptions.body = typeof body === "object" ? JSON.stringify(body) : body
  }

  try {
    const response = await fetchWithTimeout(url, requestOptions)

    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      // Try to parse error response
      let errorData
      try {
        errorData = await response.json()
      } catch (e) {
        errorData = { message: response.statusText }
      }

      throw new Error(errorData.message || `API request failed with status ${response.status}`)
    }

    // Parse JSON response
    return (await response.json()) as T
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

/**
 * API client for making requests to your backend
 */
export const apiClient = {
  /**
   * Make a GET request to the API
   */
  async get<T>(endpoint: string, options: Omit<FetchOptions, "method"> = {}): Promise<T> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
    return fetchApi<T>(url, { ...options, method: "GET" })
  },

  /**
   * Make a POST request to the API
   */
  async post<T>(endpoint: string, data: any, options: Omit<FetchOptions, "method" | "body"> = {}): Promise<T> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
    return fetchApi<T>(url, { ...options, method: "POST", body: data })
  },

  /**
   * Make a PUT request to the API
   */
  async put<T>(endpoint: string, data: any, options: Omit<FetchOptions, "method" | "body"> = {}): Promise<T> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
    return fetchApi<T>(url, { ...options, method: "PUT", body: data })
  },

  /**
   * Make a DELETE request to the API
   */
  async delete<T>(endpoint: string, options: Omit<FetchOptions, "method"> = {}): Promise<T> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
    return fetchApi<T>(url, { ...options, method: "DELETE" })
  },
}
