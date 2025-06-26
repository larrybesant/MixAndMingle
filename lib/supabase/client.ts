import { createClient } from "@supabase/supabase-js"

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
<<<<<<< HEAD
    // Removed explicit storage option for SSR/cookie compatibility
=======
>>>>>>> 1ef822f059b7d81d49cba6111a546fd184845679
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

<<<<<<< HEAD
  // Get current session
  getCurrentSession: async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    return { session, error };
  },
  // Sign up with email/password
  signUp: async (
    email: string,
    password: string,
    metadata?: Record<string, unknown>,
  ) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: undefined,
      },
    });
  },

  // Sign in with email/password
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  // Sign in with OAuth (GitHub, Discord)
  signInWithOAuth: async (provider: "github" | "discord") => {
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
=======
  async signUp(email: string, password: string, metadata?: Record<string, unknown>) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
>>>>>>> 1ef822f059b7d81d49cba6111a546fd184845679
        },
      })
      return { data, error }
    } catch (err) {
      console.error("Error signing up:", err)
      return { data: null, error: err as Error }
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (err) {
      console.error("Error signing in:", err)
      return { data: null, error: err as Error }
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
      return { data, error }
    } catch (err) {
      console.error("Error with OAuth:", err)
      return { data: null, error: err as Error }
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

<<<<<<< HEAD
  // Resend email verification
  resendVerification: async (email: string) => {
    return await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
=======
  async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email)
      return { data, error }
    } catch (err) {
      console.error("Error resetting password:", err)
      return { data: null, error: err as Error }
    }
>>>>>>> 1ef822f059b7d81d49cba6111a546fd184845679
  },

  async updatePassword(password: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({ password })
      return { data, error }
    } catch (err) {
      console.error("Error updating password:", err)
      return { data: null, error: err as Error }
    }
  },

  async resendVerification(email: string) {
    try {
      const { data, error } = await supabase.auth.resend({
        type: "signup",
        email,
      })
      return { data, error }
    } catch (err) {
      console.error("Error resending verification:", err)
      return { data: null, error: err as Error }
    }
  },
}
