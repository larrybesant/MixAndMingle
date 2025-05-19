"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"

interface Referral {
  id: string
  referrer_id: string
  referred_id: string | null
  referred_email: string
  referral_code: string
  status: string
  created_at: string
  converted_at: string | null
  referrer?: {
    id: string
    username: string
    avatar_url: string | null
  }
  referred?: {
    id: string
    username: string
    avatar_url: string | null
  } | null
}

export function useReferral() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createBrowserClient()

  useEffect(() => {
    if (!user) return

    const fetchReferrals = async () => {
      setIsLoading(true)

      try {
        const { data, error } = await supabase
          .from("referrals")
          .select(`
            *,
            referrer:referrer_id (
              id,
              username,
              avatar_url
            ),
            referred:referred_id (
              id,
              username,
              avatar_url
            )
          `)
          .eq("referrer_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setReferrals(data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReferrals()
  }, [user, supabase])

  const createReferral = async (email: string) => {
    if (!user) {
      setError("You must be logged in to create a referral")
      return
    }

    try {
      // Generate a unique referral code
      const referralCode = `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

      const { data, error } = await supabase
        .from("referrals")
        .insert([
          {
            referrer_id: user.id,
            referred_email: email,
            referral_code: referralCode,
            status: "pending",
          },
        ])
        .select()
        .single()

      if (error) {
        throw error
      }

      // In a real implementation, you would send an email to the referred user
      // with a link containing the referral code

      setReferrals((prev) => [data, ...prev])

      return {
        success: true,
        referral: data,
        referralCode,
      }
    } catch (err: any) {
      setError(err.message)
      return {
        success: false,
        error: err.message,
      }
    }
  }

  return {
    referrals,
    isLoading,
    error,
    createReferral,
  }
}
