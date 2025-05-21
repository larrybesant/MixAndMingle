"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function DebugResetLinkPage() {
  const searchParams = useSearchParams()
  const [allParams, setAllParams] = useState<Record<string, string>>({})

  // Extract all search parameters
  useState(() => {
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    setAllParams(params)
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-black p-8">
      <div className="max-w-3xl mx-auto bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-indigo-900/50">
        <h1 className="text-2xl font-bold mb-6 text-white">Debug: Password Reset Link</h1>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-white">URL Parameters:</h2>
          <pre className="bg-black/50 p-4 rounded overflow-auto text-green-400 font-mono text-sm">
            {JSON.stringify(allParams, null, 2)}
          </pre>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-white">Firebase Reset Link Structure:</h2>
          <div className="bg-black/50 p-4 rounded text-gray-300">
            <p>Firebase password reset links typically contain:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <code className="text-green-400">mode=resetPassword</code> - Action type
              </li>
              <li>
                <code className="text-green-400">oobCode=...</code> - One-time code for the reset
              </li>
              <li>
                <code className="text-green-400">apiKey=...</code> - Your Firebase API key
              </li>
              <li>
                <code className="text-green-400">lang=...</code> - Language code (optional)
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-white">Next Steps:</h2>
          <div className="bg-black/50 p-4 rounded text-gray-300">
            <p>
              If you see the <code className="text-green-400">oobCode</code> parameter above:
            </p>
            <div className="mt-2">
              <Link
                href={`/reset-password?oobCode=${searchParams.get("oobCode") || ""}`}
                className="text-indigo-400 hover:underline"
              >
                Try manually going to the reset password page
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <Link href="/login" className="text-indigo-400 hover:underline">
            Back to Login
          </Link>
          <Link href="/forgot-password" className="text-indigo-400 hover:underline">
            Request New Reset Link
          </Link>
        </div>
      </div>
    </div>
  )
}
