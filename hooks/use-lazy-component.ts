"use client"

import { lazy, type ComponentType } from "react"

export function useLazyComponent<T = any>(importFunc: () => Promise<{ default: ComponentType<T> }>): ComponentType<T> {
  return lazy(importFunc)
}
