import type { ComponentType } from "react"

type ImportFunction = () => Promise<{ default: ComponentType<any> }>

const preloadedComponents = new Set<string>()

export function preloadComponent(importFunc: ImportFunction, key: string): void {
  if (preloadedComponents.has(key)) return

  // Start loading the component
  importFunc()
  preloadedComponents.add(key)
}

export function preloadOnHover(
  importFunc: ImportFunction,
  key: string,
): {
  onMouseEnter: () => void
  onFocus: () => void
} {
  return {
    onMouseEnter: () => preloadComponent(importFunc, key),
    onFocus: () => preloadComponent(importFunc, key),
  }
}
