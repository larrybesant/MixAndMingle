"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireProfile?: boolean
  redirectTo?: string
}

export function AuthGuard({ children, requireAuth = false, requireProfile = false, redirectTo }: AuthGuardProps) {
  const { user, loading, initialized } = useAuth()
  const [profileExists, setProfileExists] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Check if user has a complete profile
  useEffect(() => {
    let mounted = true

    const checkProfile = async () => {
      if (!user || !initialized) {
        setChecking(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("username, bio, music_preferences, avatar_url, profile_completed")
          .eq("id", user.id)
          .single()

        if (!mounted) return

        if (error || !data) {
          setProfileExists(false)
        } else {
          // Check if profile is complete
          const isComplete = data.username && data.bio && data.music_preferences && data.profile_completed

          setProfileExists(isComplete)
        }
      } catch (err) {
        if (mounted) {
          setProfileExists(false)
        }
      } finally {
        if (mounted) {
          setChecking(false)
        }
      }
    }

    if (initialized) {
      checkProfile()
    }

    return () => {
      mounted = false
    }
  }, [user, initialized])

  // Handle routing logic
  useEffect(() => {
    if (!initialized || loading || checking) return

    // Prevent redirect loops by checking current path
    const currentPath = pathname

    if (requireAuth && !user) {
      if (currentPath !== "/login") {
        router.replace("/login")
      }
      return
    }

    if (user && requireProfile && profileExists === false) {
      if (currentPath !== "/create-profile") {
        router.replace("/create-profile")
      }
      return
    }

    if (user && currentPath === "/login") {
      // User is logged in but on login page
      if (profileExists === false) {
        router.replace("/create-profile")
      } else if (profileExists === true) {
        router.replace("/dashboard")
      }
      return
    }

    if (user && currentPath === "/create-profile" && profileExists === true) {
      // User has complete profile but on create-profile page
      router.replace("/dashboard")
      return
    }

    if (redirectTo && currentPath !== redirectTo) {
      router.replace(redirectTo)
    }
  }, [user, initialized, loading, checking, profileExists, requireAuth, requireProfile, redirectTo, pathname, router])

  // Show loading while checking
  if (!initialized || loading || checking) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  // Show children if all checks pass
  return <>{children}</>
}
