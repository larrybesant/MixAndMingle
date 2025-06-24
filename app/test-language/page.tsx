"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useLanguagePreference, useTranslation } from '@/hooks/useLanguagePreference'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const ADMIN_EMAIL = "larrybesant@gmail.com"; // Admin email

export default function LanguageTestPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const { language, setLanguage, availableLanguages, getCurrentLanguage } = useLanguagePreference()
  const { t } = useTranslation()
  const [testMessage, setTestMessage] = useState('')
  
  // Admin protection
  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      if (!data.user || data.user.email !== ADMIN_EMAIL) {
        router.replace("/login");
        return;
      }
      setIsAuthorized(true);
    }
    checkAuth();
  }, [router]);

  if (!isAuthorized) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div>Checking authorization...</div>
    </div>
  }
  const testLanguageFeature = () => {
    const currentLang = getCurrentLanguage()
    setTestMessage(`✅ Language feature working! Current: ${currentLang.flag} ${currentLang.name}`)
    
    // Test localStorage (only in browser)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('preferredLanguage')
      console.log('📦 localStorage test:', stored)
      
      // Dispatch language change event
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language } 
      }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black px-4">
      <div className="w-full max-w-lg bg-black/80 border border-purple-500/30 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent mb-6">
          🌍 Language Feature Test
        </h1>
        
        <div className="space-y-6">
          {/* Language Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('signup.language')}
            </label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full bg-gray-900/50 border-gray-600 text-white">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span>{getCurrentLanguage().flag}</span>
                    <span>{getCurrentLanguage().name}</span>
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
            <p className="text-gray-400 text-xs mt-1">
              {t('signup.languageHint')}
            </p>
          </div>

          {/* Translation Examples */}
          <div className="bg-gray-900/30 border border-gray-600 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">Translation Examples:</h3>
            <div className="space-y-2 text-sm">
              <div className="text-gray-300">
                <strong>Title:</strong> <span className="text-blue-400">{t('signup.title')}</span>
              </div>
              <div className="text-gray-300">
                <strong>Username:</strong> <span className="text-green-400">{t('signup.username')}</span>
              </div>
              <div className="text-gray-300">
                <strong>Email:</strong> <span className="text-yellow-400">{t('signup.email')}</span>
              </div>
              <div className="text-gray-300">
                <strong>Password:</strong> <span className="text-purple-400">{t('signup.password')}</span>
              </div>
              <div className="text-gray-300">
                <strong>Create Account:</strong> <span className="text-pink-400">{t('signup.createAccount')}</span>
              </div>
            </div>
          </div>

          {/* Test Button */}
          <Button
            onClick={testLanguageFeature}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
          >
            🧪 Test Language Feature
          </Button>

          {/* Test Results */}
          {testMessage && (
            <div className="bg-green-900/20 border border-green-500/30 text-green-200 px-4 py-3 rounded-lg text-sm">
              {testMessage}
            </div>
          )}

          {/* Current Language Info */}
          <div className="bg-blue-900/20 border border-blue-500/30 text-blue-200 px-4 py-3 rounded-lg text-sm">
            <strong>Current Language:</strong> {getCurrentLanguage().flag} {getCurrentLanguage().name} ({language})
            <br />
            <strong>localStorage:</strong> {localStorage.getItem('preferredLanguage') || 'Not set'}
          </div>

          {/* Navigation */}
          <div className="text-center space-y-2">
            <div>
              <a href="/signup" className="text-purple-400 hover:text-purple-300 underline mr-4">
                Go to Signup
              </a>
              <a href="/login" className="text-cyan-400 hover:text-cyan-300 underline">
                Go to Login
              </a>
            </div>
            <div>
              <a href="/cleanup" className="text-red-400 hover:text-red-300 underline text-xs">
                User Cleanup Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
