"use client"

import { Suspense, lazy, type ComponentType, type ReactNode } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface LazyComponentProps {
  component: () => Promise<{ default: ComponentType<any> }>
  fallback?: ReactNode
  props?: Record<string, any>
}

export function LazyComponent({ component, fallback, props = {} }: LazyComponentProps) {
  const LazyComponent = lazy(component)

  return (
    <Suspense fallback={fallback || <Skeleton className="w-full h-[200px]" />}>
      <LazyComponent {...props} />
    </Suspense>
  )
}
