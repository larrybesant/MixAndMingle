import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
}

// Supabase client configuration with auth settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
    // Removed explicit storage option for SSR/cookie compatibility
  },
  global: {
    headers: {
      "X-Client-Info": "mixandmingle-app",
    },
  },
});

// Auth helper functions
export const authHelpers = {
  // Get current user
  getCurrentUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  },

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
        },
      },
    });
  },

  // Sign out
  signOut: async () => {
    return await supabase.auth.signOut();
  },

  // Reset password
  resetPassword: async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
  },

  // Update password
  updatePassword: async (password: string) => {
    return await supabase.auth.updateUser({ password });
  },

  // Resend email verification
  resendVerification: async (email: string) => {
    return await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
  },
};
