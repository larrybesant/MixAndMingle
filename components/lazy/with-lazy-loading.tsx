"use client"

import { type ComponentType, Suspense, lazy, type ReactNode } from "react"
import { ErrorBoundary } from "./error-boundary"
import { Skeleton } from "@/components/ui/skeleton"

interface WithLazyLoadingOptions {
  fallback?: ReactNode
  errorFallback?: ReactNode
  ssr?: boolean
}

export function withLazyLoading<P = {}>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options: WithLazyLoadingOptions = {},
): ComponentType<P> {
  const { fallback = <Skeleton className="w-full h-[200px]" />, errorFallback, ssr = false } = options

  const LazyComponent = lazy(importFunc)

  const WithLazyLoading = (props: P) => (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  )

  // Set display name for debugging
  const componentName = importFunc.toString().match(/\/([^/]+)'/)?.[1] || "LazyComponent"
  WithLazyLoading.displayName = `withLazyLoading(${componentName})`

  return WithLazyLoading
}
