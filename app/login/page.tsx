'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguagePreference, useTranslation } from '@/hooks/useLanguagePreference';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { language, setLanguage, availableLanguages, getCurrentLanguage } = useLanguagePreference();
  const { t } = useTranslation();
  const router = useRouter();
  const checkProfileAndRedirect = async (userId: string) => {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile check timeout')), 5000)
      );
      
      const profilePromise = supabase
        .from("profiles")
        .select("id, username, bio, music_preferences, avatar_url, gender, relationship_style")
        .eq("id", userId)
        .single();
      
      const { data: profileData, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;
      
      if (profileError && profileError.code === 'PGRST116') {
        console.log('No profile found, redirecting to create profile');
        router.push("/create-profile");
        return;
      } else if (profileError) {
        console.log('Profile error, redirecting to dashboard with error flag');
        router.push("/dashboard?profile_error=true");
        return;
      }
      
      const profileComplete = !!(
        profileData?.username?.trim() && 
        profileData?.bio?.trim() && 
        profileData?.music_preferences?.length > 0 &&
        profileData?.avatar_url?.trim() &&
        profileData?.gender?.trim()
      );
      
      if (!profileComplete) {
        console.log('Profile incomplete, redirecting to setup');
        router.push("/setup-profile");
      } else {
        console.log('Profile complete, redirecting to dashboard');
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      console.error('Profile check error:', error);
      console.log('Fallback: redirecting to dashboard with error flag');
      // Add longer timeout before redirect as fallback
      setTimeout(() => {
        router.push("/dashboard?login_error=true");
      }, 1000);
    }
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }    try {
      await supabase.auth.signOut();
      
      const { error, data } = await supabase.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please verify your email before logging in.');
        } else if (error.message.includes('User not found')) {
          setError('No account found with this email. Please sign up first.');
        } else if (error.message.includes('Too many requests')) {
          setError('Too many attempts. Please wait and try again.');
        } else {
          setError(`Login failed: ${error.message}`);
        }
      } else if (data.user) {
        await checkProfileAndRedirect(data.user.id);
      } else {
        setError('Login completed but no user data returned. Please try again.');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Unexpected error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }  };

  useEffect(() => {
    async function checkOnMount() {
      const { data } = await supabase.auth.getUser();
      
      if (data.user) {
        await checkProfileAndRedirect(data.user.id);
      }
    }
    checkOnMount();
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Language Selector in top-right */}
      <div className="absolute top-4 right-4">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-auto bg-black/40 border-gray-600 text-white text-sm">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span>{getCurrentLanguage().flag}</span>
                <span className="hidden sm:inline">{getCurrentLanguage().name}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-600">
            {availableLanguages.map((lang) => (
              <SelectItem 
                key={lang.code} 
                value={lang.code}
                className="text-white hover:bg-gray-800 focus:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="max-w-xs sm:max-w-sm w-full space-y-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl font-black tracking-wider mb-2">
            <span className="text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.8)] font-extrabold">MIX</span>
            <span className="text-orange-400 text-5xl mx-2 drop-shadow-[0_0_15px_rgba(251,146,60,0.8)] font-serif transform rotate-6 inline-block">𝄞</span>
            <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] font-extrabold">MINGLE</span>
          </div>          <h1 className="text-2xl font-bold text-white">{t('login.title')}</h1>
          <p className="text-gray-400 text-sm mt-2">{t('login.subtitle')}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-600/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}        <div className="space-y-4">
          <Input
            type="email"
            placeholder={t('login.email')}
            className="w-full bg-black/40 text-white placeholder-white/60 focus:border-purple-400 focus:ring-purple-400 rounded-xl h-12"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <Input
            type="password"
            placeholder={t('login.password')}
            className="w-full bg-black/40 text-white placeholder-white/60 focus:border-purple-400 focus:ring-purple-400 rounded-xl h-12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleLogin();
              }
            }}
          />

          <Button
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('login.signingIn')}
              </div>
            ) : t('login.signIn')}
          </Button>
        </div>

        {/* Social Sign-In */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-600" />
          </div>          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black px-2 text-gray-400">{t('login.continueWith')}</span>          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-400">
            {t('login.noAccount')}{' '}
            <a href="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              {t('login.signUp')}
            </a>
          </p>
          <p className="text-xs text-gray-500">
            <a href="/forgot-password" className="hover:text-gray-400 transition-colors">
              {t('login.forgotPassword')}
            </a>
          </p>
          
          {/* Emergency redirect if stuck */}
          {loading && (
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <p className="text-xs text-yellow-400 mb-2">Stuck on redirecting?</p>
              <button
                onClick={() => {
                  setLoading(false);
                  router.push('/dashboard');
                }}
                className="text-xs text-yellow-300 hover:text-yellow-200 underline"
              >
                Force redirect to dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
