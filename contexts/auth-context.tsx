"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, authHelpers } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  email?: string;
  location?: string;
  website?: string;
  music_preferences?: string[];
  is_dj?: boolean;
  privacy_settings?: Record<string, boolean>;
  profile_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  // State
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  // Auth methods
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, unknown>,
  ) => Promise<{ error: AuthError | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (
    provider: "github" | "discord",
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  resendVerification: (email: string) => Promise<{ error: AuthError | null }>;

  // Profile methods
  updateProfile: (
    updates: Partial<UserProfile>,
  ) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;

  // Utility methods
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch user profile from Supabase
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Error fetching profile:", err);
      return null;
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error("No user logged in") };
    }

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        return { error };
      }

      // Refresh profile
      await refreshProfile();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { session } = await authHelpers.getCurrentSession();

        if (session?.user) {
          setUser(session.user);
          setSession(session);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        setError("Failed to initialize authentication");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Auth methods
  const signUp = async (
    email: string,
    password: string,
    metadata?: Record<string, unknown>,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authHelpers.signUp(email, password, metadata);

      if (result.error) {
        setError(result.error.message);
      }

      return { error: result.error };
    } catch (error) {
      const authError = new Error("Unexpected signup error") as AuthError;
      setError(authError.message);
      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authHelpers.signIn(email, password);

      if (result.error) {
        setError(result.error.message);
      }

      return { error: result.error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithOAuth = async (provider: "github" | "discord") => {
    setLoading(true);
    setError(null);

    try {
      const result = await authHelpers.signInWithOAuth(provider);

      if (result.error) {
        setError(result.error.message);
      }

      return { error: result.error };
    } catch (error) {
      console.error("Unexpected OAuth error:", error);
      const authError = new Error("Unexpected OAuth error") as AuthError;
      setError(authError.message);
      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);

    try {
      await authHelpers.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      router.push("/");
    } catch (error) {
      console.error("Failed to sign out:", error);
      setError("Failed to sign out");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);

    try {
      const result = await authHelpers.resetPassword(email);

      if (result.error) {
        setError(result.error.message);
      }

      return { error: result.error };
    } catch (error) {
      console.error("Unexpected password reset error:", error);
      const authError = new Error(
        "Unexpected password reset error",
      ) as AuthError;
      setError(authError.message);
      return { error: authError };
    }
  };

  const updatePassword = async (password: string) => {
    setError(null);

    try {
      const result = await authHelpers.updatePassword(password);

      if (result.error) {
        setError(result.error.message);
      }

      return { error: result.error };
    } catch (error) {
      console.error("Unexpected password update error:", error);
      const authError = new Error(
        "Unexpected password update error",
      ) as AuthError;
      setError(authError.message);
      return { error: authError };
    }
  };

  const resendVerification = async (email: string) => {
    setError(null);

    try {
      const result = await authHelpers.resendVerification(email);

      if (result.error) {
        setError(result.error.message);
      }

      return { error: result.error };
    } catch (error) {
      console.error("Unexpected verification error:", error);
      const authError = new Error("Unexpected verification error") as AuthError;
      setError(authError.message);
      return { error: authError };
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    // State
    user,
    profile,
    session,
    loading,
    error,

    // Auth methods
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    resendVerification,

    // Profile methods
    updateProfile,
    refreshProfile,

    // Utility methods
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
export default AuthProvider;
