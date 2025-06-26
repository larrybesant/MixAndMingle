import { createClient, AuthError } from "@supabase/supabase-js"

// Your Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ywfjmsbyksehjgwalqum.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zmptc2J5a3NlaGpnd2FscXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzIwNjgsImV4cCI6MjA2MjkwODA2OH0.fXx5d7iRXgpJDB_jAKgtRa2pVoAPBHU9Rly0T14HsVs"

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
})

// Auth helpers with better error handling
export const authHelpers = {
  async getCurrentSession() {
    try {
      const { data, error } = await supabase.auth.getSession()
      return { session: data.session, error }
    } catch (err) {
      console.error("Error getting session:", err)
      return { session: null, error: err as Error }
    }
  },

  async signUp(email: string, password: string, metadata?: Record<string, unknown>) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })
      return { data, error: error as AuthError | null }
    } catch (err) {
      console.error("Error signing up:", err)
      // Return null if not an AuthError
      return { data: null, error: null }
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error: error as AuthError | null }
    } catch (err) {
      console.error("Error signing in:", err)
      // Return null if not an AuthError
      return { data: null, error: null }
    }
  },

  async signInWithOAuth(provider: "google" | "github" | "discord") {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      return { data, error: error as AuthError | null }
    } catch (err) {
      console.error("Error with OAuth:", err)
      // Return null if not an AuthError
      return { data: null, error: null }
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (err) {
      console.error("Error signing out:", err)
      return { error: err as Error }
    }
  },

  async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email)
      return { data, error: error as AuthError | null }
    } catch (err) {
      console.error("Error resetting password:", err)
      return { data: null, error: null }
    }
  },

  async updatePassword(password: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({ password })
      return { data, error: error as AuthError | null }
    } catch (err) {
      console.error("Error updating password:", err)
      return { data: null, error: null }
    }
  },

  async resendVerification(email: string) {
    try {
      const { data, error } = await supabase.auth.resend({
        type: "signup",
        email,
      })
      return { data, error: error as AuthError | null }
    } catch (err) {
      console.error("Error resending verification:", err)
      return { data: null, error: null }
    }
  },
}
