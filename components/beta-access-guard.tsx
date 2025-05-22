"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { isUserBetaTester } from "@/lib/firebase/beta-access"
import BetaLogin from "@/components/beta-login"
import { Loader2 } from "lucide-react"

interface BetaAccessGuardProps {
  children: React.ReactNode
}

export default function BetaAccessGuard({ children }: BetaAccessGuardProps) {
  const { user, loading: authLoading } = useAuth()
  const [hasBetaAccess, setHasBetaAccess] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user has beta access
  useEffect(() => {
    async function checkBetaAccess() {
      if (!user) {
        setHasBetaAccess(false)
        setIsLoading(false)
        return
      }

      try {
        const isBetaTester = await isUserBetaTester(user.uid)
        setHasBetaAccess(isBetaTester)
      } catch (error) {
        console.error("Error checking beta access:", error)
        setHasBetaAccess(false)
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      checkBetaAccess()
    }
  }, [user, authLoading])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?from=beta")
    }
  }, [user, authLoading, router])

  // Show loading state while checking
  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Checking beta access...</p>
        </div>
      </div>
    )
  }

  // If user doesn't have beta access, show the beta login
  if (!hasBetaAccess) {
    return <BetaLogin />
  }

  // User has beta access, show the protected content
  return <>{children}</>
}
