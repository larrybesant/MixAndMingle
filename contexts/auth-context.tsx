"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, Session, AuthError } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
  bio?: string
  email?: string
  location?: string
  website?: string
  music_preferences?: string[]
  is_dj?: boolean
  privacy_settings?: Record<string, boolean>
  profile_completed?: boolean
  created_at?: string
  updated_at?: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  error: string | null
  initialized: boolean

  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithOAuth: (provider: "google" | "github" | "discord") => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>
  resendVerification: (email: string) => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if we're in preview mode
  const isPreviewMode = typeof window !== "undefined" && window.location.hostname.includes("vusercontent.net")

  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    if (isPreviewMode) {
      // Return mock profile for preview
      return {
        id: userId,
        username: "john_doe",
        full_name: "John Doe",
        bio: "Music lover and aspiring DJ. Love connecting with people through beats and good vibes!",
        location: "Los Angeles, CA",
        music_preferences: ["House", "Techno", "Hip-Hop"],
        is_dj: true,
        avatar_url: "",
        profile_completed: true,
        email: "john@example.com",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    try {
      const { supabase } = await import("@/lib/supabase/client")
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
      if (error) {
        console.log("Profile fetch error:", error.message)
        return null
      }
      return data
    } catch (err) {
      console.log("Profile fetch failed")
      return null
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error("No user logged in") }
    }

    if (isPreviewMode) {
      // Mock success in preview
      setProfile((prev) => (prev ? { ...prev, ...updates } : null))
      return { error: null }
    }

    try {
      const { supabase } = await import("@/lib/supabase/client")
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        return { error }
      }

      await refreshProfile()
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        if (isPreviewMode) {
          // Mock user for preview
          const mockUser = {
            id: "mock-user-id",
            email: "john@example.com",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: {},
            aud: "authenticated",
            confirmation_sent_at: new Date().toISOString(),
            recovery_sent_at: new Date().toISOString(),
            email_change_sent_at: new Date().toISOString(),
            new_email: undefined,
            invited_at: undefined,
            action_link: undefined,
            email_confirmed_at: new Date().toISOString(),
            phone_confirmed_at: undefined,
            confirmed_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            role: "authenticated",
            phone: undefined,
            email_change: undefined,
            email_change_confirm_status: 0,
            banned_until: undefined,
            identities: [],
            factors: [],
          } as User

          const mockSession = {
            access_token: "mock-token",
            refresh_token: "mock-refresh",
            expires_in: 3600,
            expires_at: Date.now() + 3600000,
            token_type: "bearer",
            user: mockUser,
          } as Session

          if (mounted) {
            setUser(mockUser)
            setSession(mockSession)
            const profileData = await fetchProfile(mockUser.id)
            setProfile(profileData)
            setLoading(false)
            setInitialized(true)
          }
          return
        }

        const { supabase } = await import("@/lib/supabase/client")

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (session?.user) {
          setUser(session.user)
          setSession(session)
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return

          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {
            const profileData = await fetchProfile(session.user.id)
            setProfile(profileData)
          } else {
            setProfile(null)
          }

          setLoading(false)
          setInitialized(true)
        })

        setLoading(false)
        setInitialized(true)

        return () => {
          subscription.unsubscribe()
        }
      } catch (err) {
        console.error("Error initializing auth:", err)
        if (mounted) {
          setError("Failed to initialize authentication")
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, [isPreviewMode])

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    setLoading(true)
    setError(null)

    if (isPreviewMode) {
      setLoading(false)
      return { error: null }
    }

    try {
      const { supabase } = await import("@/lib/supabase/client")
      const { error } = await supabase.auth.signUp({ email, password, options: { data: metadata } })
      if (error) setError(error.message)
      return { error }
    } catch (error) {
      const authError = new Error("Unexpected signup error") as AuthError
      setError(authError.message)
      return { error: authError }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    if (isPreviewMode) {
      setLoading(false)
      return { error: null }
    }

    try {
      const { supabase } = await import("@/lib/supabase/client")
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signInWithOAuth = async (provider: "google" | "github" | "discord") => {
    setLoading(true)
    setError(null)

    if (isPreviewMode) {
      setLoading(false)
      return { error: null }
    }

    try {
      const { supabase } = await import("@/lib/supabase/client")
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) setError(error.message)
      return { error }
    } catch (error) {
      const authError = new Error("Unexpected OAuth error") as AuthError
      setError(authError.message)
      return { error: authError }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      if (!isPreviewMode) {
        const { supabase } = await import("@/lib/supabase/client")
        await supabase.auth.signOut()
      }
      setUser(null)
      setProfile(null)
      setSession(null)
    } catch (error) {
      console.error("Failed to sign out:", error)
      setError("Failed to sign out")
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    setError(null)

    if (isPreviewMode) {
      return { error: null }
    }

    try {
      const { supabase } = await import("@/lib/supabase/client")
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) setError(error.message)
      return { error }
    } catch (error) {
      const authError = new Error("Unexpected password reset error") as AuthError
      setError(authError.message)
      return { error: authError }
    }
  }

  const updatePassword = async (password: string) => {
    setError(null)

    if (isPreviewMode) {
      return { error: null }
    }

    try {
      const { supabase } = await import("@/lib/supabase/client")
      const { error } = await supabase.auth.updateUser({ password })
      if (error) setError(error.message)
      return { error }
    } catch (error) {
      const authError = new Error("Unexpected password update error") as AuthError
      setError(authError.message)
      return { error: authError }
    }
  }

  const resendVerification = async (email: string) => {
    setError(null)

    if (isPreviewMode) {
      return { error: null }
    }

    try {
      const { supabase } = await import("@/lib/supabase/client")
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      })
      if (error) setError(error.message)
      return { error }
    } catch (error) {
      const authError = new Error("Unexpected verification error") as AuthError
      setError(authError.message)
      return { error: authError }
    }
  }

  const clearError = () => setError(null)

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    error,
    initialized,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    resendVerification,
    updateProfile,
    refreshProfile,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default AuthProvider
