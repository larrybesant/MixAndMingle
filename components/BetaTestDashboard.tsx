'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function BetaTestDashboard() {
  const [status, setStatus] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const checkAuthStatus = async () => {
    setLoading(true)
    addLog('🔍 Checking authentication status...')

    try {
      // Check current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        addLog(`❌ User check error: ${userError.message}`)
        setStatus((prev: any) => ({ ...prev, user: null, userError: userError.message }))
      } else {
        addLog(user ? `✅ User logged in: ${user.email}` : 'ℹ️ No user logged in')
        setStatus((prev: any) => ({ ...prev, user, userError: null }))
      }

      // Check Supabase connection
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)

      if (profileError) {
        addLog(`❌ Database connection error: ${profileError.message}`)
        setStatus((prev: any) => ({ ...prev, database: false, dbError: profileError.message }))
      } else {
        addLog('✅ Database connection working')
        setStatus((prev: any) => ({ ...prev, database: true, dbError: null }))
      }

      // Check user profile if logged in
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          addLog(`⚠️ Profile error: ${profileError.message}`)
          setStatus((prev: any) => ({ ...prev, profile: null, profileError: profileError.message }))
        } else {
          addLog('✅ User profile found')
          setStatus((prev: any) => ({ ...prev, profile, profileError: null }))
        }
      }

    } catch (error: any) {
      addLog(`❌ Status check failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const createTestAccount = async () => {
    setLoading(true)
    addLog('🧪 Creating test account...')

    try {
      // Sign out first
      await supabase.auth.signOut()
      addLog('🔄 Signed out existing user')

      // Create test account
      const testEmail = `test-${Date.now()}@mixandmingle.app`
      const testPassword = 'TestPassword123!'

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (signUpError && !signUpError.message.includes('User already registered')) {
        throw signUpError
      }

      addLog(`📝 Signup completed for ${testEmail}`)

      // Try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })

      if (signInError) {
        throw signInError
      }

      addLog('✅ Test account login successful')

      // Create profile
      if (signInData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: signInData.user.id,
            email: testEmail,
            language: 'en',
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          addLog(`⚠️ Profile creation warning: ${profileError.message}`)
        } else {
          addLog('✅ Test profile created')
        }
      }

      // Refresh status
      await checkAuthStatus()

    } catch (error: any) {
      addLog(`❌ Test account creation failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testLoginFlow = async () => {
    setLoading(true)
    addLog('🔐 Testing login flow...')

    try {
      // Test logout
      await supabase.auth.signOut()
      addLog('✅ Logout successful')

      // Test login with known credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@mixandmingle.app',
        password: 'TestPassword123!'
      })

      if (error) {
        throw error
      }

      addLog('✅ Login flow successful')
      await checkAuthStatus()

    } catch (error: any) {
      addLog(`❌ Login flow failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const goToDashboard = () => {
    window.location.href = '/dashboard'
  }

  const goToApp = () => {
    window.location.href = '/'
  }

  const runQuickDiagnostic = async () => {
    addLog('🚀 Running quick diagnostic...')
    await checkAuthStatus()
    
    if (!status.user) {
      addLog('👤 No user found, creating test account...')
      await createTestAccount()
    }
    
    if (status.user && !status.profile) {
      addLog('📋 Creating missing profile...')
      // Create profile logic here
    }
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const getStatusIcon = (condition: boolean | null) => {
    if (condition === null) return '⏳'
    return condition ? '✅' : '❌'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🧪 Beta Test Dashboard
          </h1>
          <p className="text-gray-600 mb-6">
            Comprehensive testing tools for Mix & Mingle authentication and features
          </p>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">
                {getStatusIcon(status.database)} Database Connection
              </h3>
              <p className="text-sm text-gray-600">
                {status.database ? 'Connected to Supabase' : status.dbError || 'Checking...'}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">
                {getStatusIcon(!!status.user)} Authentication
              </h3>
              <p className="text-sm text-gray-600">
                {status.user ? `Logged in as ${status.user.email}` : status.userError || 'Not logged in'}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">
                {getStatusIcon(!!status.profile)} User Profile
              </h3>
              <p className="text-sm text-gray-600">
                {status.profile ? 'Profile exists' : status.profileError || 'No profile'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <button
              onClick={checkAuthStatus}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              🔍 Check Status
            </button>

            <button
              onClick={createTestAccount}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              🧪 Create Test Account
            </button>

            <button
              onClick={testLoginFlow}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
            >
              🔐 Test Login
            </button>

            <button
              onClick={runQuickDiagnostic}
              disabled={loading}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm"
            >
              🚀 Quick Fix
            </button>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={goToDashboard}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700"
            >
              🏠 Go to Dashboard
            </button>

            <button
              onClick={goToApp}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              🌍 Go to App
            </button>

            <a
              href="/cleanup"
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 inline-block text-center"
            >
              🧹 Cleanup Page
            </a>

            <a
              href="/test-language"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 inline-block text-center"
            >
              🌐 Test Language
            </a>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📝 Test Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setLogs([])}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
            >
              Clear Logs
            </button>
            
            <button
              onClick={() => {
                const logText = logs.join('\n')
                navigator.clipboard.writeText(logText)
                addLog('📋 Logs copied to clipboard')
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              Copy Logs
            </button>
          </div>
        </div>

        {/* Manual Steps */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-yellow-800 mb-3">
            ⚠️ If Automated Tests Fail - Manual Steps
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
            <li>Go to Supabase Dashboard → Authentication → Settings</li>
            <li>Disable "Enable email confirmations"</li>
            <li>Enable "Enable auto-confirm users"</li>
            <li>Check Site URL: http://localhost:3000</li>
            <li>Check Redirect URLs include: http://localhost:3000/dashboard</li>
            <li>Verify environment variables in .env.local</li>
            <li>Restart development server: npm run dev</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
