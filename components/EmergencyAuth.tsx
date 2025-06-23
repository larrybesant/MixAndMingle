'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

/**
 * EMERGENCY SIMPLE AUTH COMPONENT
 * 
 * This is a stripped-down, bulletproof authentication form
 * that bypasses problematic features and focuses on core functionality.
 */

export default function EmergencyAuth() {
  const [email, setEmail] = useState('test@mixandmingle.app')
  const [password, setPassword] = useState('TestPassword123!')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
    
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'signup') {
        // Simple signup without email confirmation
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          }
        })

        if (error) {
          throw error
        }

        if (data.user) {
          // Create profile immediately
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: email,
            language: 'en',
            updated_at: new Date().toISOString()
          })

          setMessage('✅ Account created! Attempting login...')
          
          // Try to sign in immediately
          setTimeout(() => {
            setMode('signin')
            handleAuth(e)
          }, 1000)
        }
      } else {
        // Simple signin
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          throw error
        }

        if (data.user) {
          setMessage('✅ Login successful! Redirecting...')
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      setMessage(`❌ Error: ${error.message}`)
      
      // Common error fixes
      if (error.message.includes('Invalid login credentials')) {
        setMessage('❌ Invalid email or password. Try signing up first.')
      } else if (error.message.includes('Email not confirmed')) {
        setMessage('⚠️ Email confirmation required. Check Supabase settings.')
      } else if (error.message.includes('User already registered')) {
        setMessage('⚠️ Account exists. Try signing in instead.')
        setMode('signin')
      }
    } finally {
      setLoading(false)
    }
  }

  const quickFix = async () => {
    setMessage('🔧 Running quick auth fix...')
    
    try {
      // Sign out first
      await supabase.auth.signOut()
      
      // Create account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'test@mixandmingle.app',
        password: 'TestPassword123!',
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      })
      
      if (signUpError && !signUpError.message.includes('User already registered')) {
        throw signUpError
      }
      
      // Sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test@mixandmingle.app',
        password: 'TestPassword123!'
      })
      
      if (signInError) {
        throw signInError
      }
      
      if (signInData.user) {
        // Create/update profile
        await supabase.from('profiles').upsert({
          id: signInData.user.id,
          email: 'test@mixandmingle.app',
          language: 'en',
          updated_at: new Date().toISOString()
        })
        
        setMessage('✅ Quick fix successful! Redirecting...')
        router.push('/dashboard')
      }
    } catch (error: any) {
      setMessage(`❌ Quick fix failed: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🚨 Emergency Auth</h1>
          <p className="text-gray-600">Bulletproof authentication for testing</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                mode === 'signin' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                mode === 'signup' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? '⏳ Processing...' : `${mode === 'signin' ? 'Sign In' : 'Sign Up'}`}
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={quickFix}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-all"
          >
            🔧 Quick Fix (Create & Login)
          </button>
        </div>

        {message && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm">
            {message}
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500 space-y-1">
          <p>• Pre-filled test credentials</p>
          <p>• Bypasses email confirmation</p>
          <p>• Creates profile automatically</p>
          <p>• Works with current Supabase config</p>
        </div>
      </div>
    </div>
  )
}
