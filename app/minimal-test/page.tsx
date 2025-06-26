"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function MinimalTestPage() {
  const [message, setMessage] = useState("Click the button to test!")

  const testBasicFunction = () => {
    setMessage("✅ Basic React functionality works!")
  }

  const testSupabaseImport = async () => {
    try {
      const { supabase } = await import("@/lib/supabase/client")
      setMessage("✅ Supabase import works!")
    } catch (err) {
      setMessage(`❌ Supabase import failed: ${err}`)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Minimal Test Page</h1>

      <div className="bg-gray-800 p-6 rounded-lg mb-8 text-center">
        <p className="text-lg">{message}</p>
      </div>

      <div className="flex gap-4">
        <Button onClick={testBasicFunction} className="bg-blue-600">
          Test Basic Function
        </Button>
        <Button onClick={testSupabaseImport} className="bg-green-600">
          Test Supabase Import
        </Button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400">If this page loads without errors, the basic setup is working.</p>
      </div>
    </div>
  )
}
