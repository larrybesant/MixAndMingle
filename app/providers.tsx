"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { FeatureFlagProvider } from "@/lib/feature-flags/feature-flag-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <FeatureFlagProvider>{children}</FeatureFlagProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
