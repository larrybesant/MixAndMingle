import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// During build time, environment variables might not be available
// Create a placeholder client that will work during build but log warnings at runtime
let supabase: any;

if (supabaseUrl && supabaseAnonKey) {
  // Normal initialization with proper credentials
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    global: {
      headers: {
        'X-Client-Info': 'mixandmingle-app',
      },
    },
  });
} else {
  // Build-time safe placeholder
  console.warn('⚠️ Supabase not initialized - missing credentials');
  supabase = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }),
      insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      upsert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }),
    }),
  };
}

export { supabase };

// Auth helper functions
export const authHelpers = {
  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session
  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },
  // Sign up with email/password
  signUp: async (email: string, password: string, metadata?: Record<string, unknown>) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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

  // Sign in with OAuth (Google, GitHub, etc.)
  signInWithOAuth: async (provider: 'google' | 'github' | 'discord') => {
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  },

  // Sign out
  signOut: async () => {
    return await supabase.auth.signOut();
  },  // Reset password
  resetPassword: async (email: string) => {
    try {
      // First try the API endpoint to avoid hook issues
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        return { error: null };
      }
      
      // If API fails, fall back to direct Supabase call
      return await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
    } catch (error) {
      console.error('Reset password error:', error);
      // Return a proper AuthError object
      const authError = {
        message: 'Failed to send reset email. Please try again.',
        name: 'AuthError',
        code: 'reset_password_failed',
        status: 500
      } as any; // Use 'as any' to bypass strict typing
      return { error: authError };
    }
  },

  // Update password
  updatePassword: async (password: string) => {
    return await supabase.auth.updateUser({ password });
  },

  // Resend email verification
  resendVerification: async (email: string) => {
    return await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },
};
