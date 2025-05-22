"use client"

import { useState, useCallback } from "react"
import { fetchApi } from "@/lib/api-client"

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function useApi<T>(options: UseApiOptions = {}) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const request = useCallback(
    async (url: string, fetchOptions: Parameters<typeof fetchApi>[1] = {}): Promise<any | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchApi(url, fetchOptions)
        setData(result as unknown as T)
        options.onSuccess?.(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        options.onError?.(error)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [options],
  )

  return {
    data,
    isLoading,
    error,
    request,
  }
}
