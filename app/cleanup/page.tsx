"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function CleanupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const handleCleanup = async () => {
    setLoading(true)
    setResult('🧹 Starting cleanup...')
    
    try {
      // Get all profiles
      const { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .limit(100)
      
      if (fetchError) {
        setResult(`❌ Error fetching profiles: ${fetchError.message}`)
        setLoading(false)
        return
      }
      
      setResult(`Found ${profiles?.length || 0} profiles. Deleting...`)
      
      if (!profiles || profiles.length === 0) {
        setResult('✅ No profiles to delete!')
        setLoading(false)
        return
      }
      
      // Delete all profiles
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Safety check
      
      if (deleteError) {
        setResult(`❌ Delete error: ${deleteError.message}`)
      } else {
        setResult(`✅ Successfully deleted ${profiles.length} profiles!`)
        
        // Sign out current user
        const { data: currentUser } = await supabase.auth.getUser()
        if (currentUser.user) {
          await supabase.auth.signOut()
          setResult(prev => prev + '\n🚪 Signed out current user')
        }
        
        setResult(prev => prev + '\n🎉 Cleanup complete! Ready to test signup.')
      }
      
    } catch (error) {
      setResult(`❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black px-4">
      <div className="w-full max-w-md bg-black/80 border border-purple-500/30 rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center text-white mb-6">
          🧹 User Cleanup
        </h1>
        
        <div className="space-y-4">
          <Button
            onClick={handleCleanup}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? 'Cleaning up...' : 'Delete All Users'}
          </Button>
          
          {result && (
            <div className="bg-gray-900/50 border border-gray-600 rounded p-4 text-white text-sm whitespace-pre-line">
              {result}
            </div>
          )}
          
          <div className="text-center">
            <a 
              href="/signup" 
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Go to Signup Page
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
