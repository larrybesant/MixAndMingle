"use client"

import type React from "react"

import { useUserPresence } from "@/hooks/use-user-presence"

interface GlobalPresenceProviderProps {
  children: React.ReactNode
}

export default function GlobalPresenceProvider({ children }: GlobalPresenceProviderProps) {
  // Set up user presence
  useUserPresence()

  // This component doesn't render anything visible
  return <>{children}</>
}
