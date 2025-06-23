"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguagePreference, useTranslation, LANGUAGES } from "@/hooks/useLanguagePreference"

export default function SignupPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { language, setLanguage, availableLanguages } = useLanguagePreference()
  const { t } = useTranslation()
  const router = useRouter()

  // Helper to sanitize input (remove HTML tags, trim, limit length)
  function sanitizeInput(input: string, maxLength: number = 100): string {
    return input.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim().slice(0, maxLength)
  }

  // Helper to validate username (alphanumeric, underscores, 3-20 chars)
  function isValidUsername(name: string): boolean {
    return /^[a-zA-Z0-9_]{3,20}$/.test(name)
  }

  // Helper to validate email
  function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
  // Helper to validate password (min 8 chars)
  function isValidPassword(pw: string): boolean {
    return pw.length >= 8
  }  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    setError("")
      try {
      // Sanitize and validate inputs
      const cleanUsername = sanitizeInput(username, 20)
      const cleanEmail = sanitizeInput(email, 100)
      const cleanPassword = password.trim()
      
      if (!cleanUsername || !cleanEmail || !cleanPassword) {
        setError("All fields are required.")
        setLoading(false)
        return
      }
      
      if (!isValidUsername(cleanUsername)) {
        setError(
          "Username must be 3-20 characters, letters, numbers, or underscores only."
        )
        setLoading(false)
        return
      }
      
      if (!isValidEmail(cleanEmail)) {
        setError("Please enter a valid email address.")
        setLoading(false)
        return
      }
      
      if (!isValidPassword(cleanPassword)) {
        setError("Password must be at least 8 characters.")
        setLoading(false)
        return
      }
      
      // Attempt signup with Supabase
        // Try signup with email confirmation disabled for testing
      const signupResult = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: { 
            username: cleanUsername,
            full_name: cleanUsername
          },
          // Remove email redirect to avoid magic link issues
          // emailRedirectTo: `${window.location.origin}/auth/callback`,
        },      })
      
      if (signupResult.error) {
        setError(`Signup failed: ${signupResult.error.message}`)      } else if (signupResult.data?.user) {
        try {
          // Create profile record immediately after successful signup
            const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: signupResult.data.user.id,
                username: cleanUsername,
                full_name: cleanUsername,
                avatar_url: null,
                bio: null,
                music_preferences: [],
                preferred_language: language,
                is_dj: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]);
            if (profileError) {
            // Don't fail completely, but let user know they may need to complete profile
            setError("⚠️ Account created but profile setup incomplete. You'll be prompted to complete your profile.");
          }
        } catch (profileErr: unknown) {
          // Continue with signup flow even if profile creation fails
        }
        
        setError("") // Clear any errors
          // Show clear success message
        setError("✅ Account created successfully! Testing language feature...")
        
        // For testing: go directly to dashboard since email confirmation might be disabled
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)} else {
        setError("Account may have been created successfully. Please try logging in or check your email.")
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Unexpected error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: "google") => {
    setError("")
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) setError(`OAuth signup failed: ${error.message}`)
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black px-4">
      <div className="w-full max-w-md bg-black/80 border border-purple-500/30 rounded-lg p-8">        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent mb-6">
          {t('signup.title')}
        </h1>
        
        <form onSubmit={handleSignUp} className="space-y-4">          <div>
            <Input
              placeholder={t('signup.username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
              autoComplete="username"
              required
            />
            {username && !isValidUsername(username) && (
              <p className="text-red-400 text-xs mt-1">Username must be 3-20 characters, letters, numbers, or underscores only.</p>
            )}
          </div>
          
          <div>
            <Input
              type="email"
              placeholder={t('signup.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
              autoComplete="email"
              required
            />
            {email && !isValidEmail(email) && (
              <p className="text-red-400 text-xs mt-1">Please enter a valid email address.</p>
            )}
          </div>
          
          <div>
            <Input
              type="password"
              placeholder={t('signup.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
              autoComplete="new-password"
              required
            />
            {password && !isValidPassword(password) && (
              <p className="text-red-400 text-xs mt-1">Password must be at least 8 characters.</p>
            )}
          </div>
          
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('signup.language')}
            </label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full bg-gray-900/50 border-gray-600 text-white">
                <SelectValue />
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
            <p className="text-gray-400 text-xs mt-1">
              {t('signup.languageHint')}
            </p>
          </div>
          
          {error && (
            <div className={`mb-4 text-sm p-3 border rounded ${
              error.includes('✅') 
                ? 'text-green-400 bg-green-900/20 border-green-500' 
                : 'text-red-400 bg-red-900/20 border-red-500'
            }`}>
              {error}
            </div>
          )}
            {/* Main signup button */}          <Button
            type="submit"
            disabled={loading}
            className="w-full mb-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t('signup.creatingAccount')}
              </div>
            ) : (
              t('signup.createAccount')
            )}
          </Button>
        </form>
        
        <Button
          type="button"
          onClick={() => handleOAuth("google")}
          className="w-full mb-4 bg-white text-black hover:bg-gray-100 border border-gray-300"
        >
          {t('signup.signUpWithGoogle')}
        </Button>
        
        <div className="text-center text-sm text-gray-400">
          {t('signup.alreadyHaveAccount')}{" "}
          <a href="/login" className="text-purple-400 hover:text-purple-300 underline">
            {t('signup.signIn')}
          </a>
        </div>
      </div>
    </div>
  )
}
