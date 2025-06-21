'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { supabase } from '../lib/supabase/client';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
}

// Replace 'any' with 'unknown' for better type safety
const AuthContext = createContext<unknown>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        console.error('Sign up error:', error.message, error.details, error);
        alert('Sign up failed: ' + (error.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Unexpected sign up error:', err);
      alert('Sign up failed: ' + (err instanceof Error ? err.message : String(err)));
    }
    setLoading(false);
  };

  const signInWithProvider = async (provider: 'google' | 'github') => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({ provider });
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signInWithProvider, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Replace 'any' with 'unknown' for better type safety
export function useAuth(): unknown {
  return useContext(AuthContext);
}

// --- Push Notification Subscription Logic (MVP) ---
// This hook can be used in your layout or navbar to prompt users to enable notifications
export function usePushNotifications(user: any) {
  useEffect(() => {
    if (!user || typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    async function subscribe() {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const reg = await navigator.serviceWorker.register('/sw.js');
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: '<YOUR_PUBLIC_VAPID_KEY>' // Replace with your VAPID public key
        });

        // Send subscription to your API
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription })
        });
      } catch (err) {
        // Optionally handle errors
      }
    }

    subscribe();
  }, [user]);
}
