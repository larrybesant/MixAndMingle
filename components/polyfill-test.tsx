"use client"

import { useState, useEffect } from "react"
import { safeCrypto } from "@/lib/utils/safe-crypto"
import { safePath } from "@/lib/utils/safe-path"
import { safeBuffer } from "@/lib/utils/safe-buffer"
import { safeUrl } from "@/lib/utils/safe-url"

export default function PolyfillTest() {
  const [results, setResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testPolyfills() {
      try {
        setLoading(true)
        const testResults: Record<string, any> = {}

        // Test crypto
        try {
          const hash = await safeCrypto.createHash("sha256", "hello world")
          testResults.crypto = {
            status: "success",
            hash,
            randomString: await safeCrypto.generateRandomString(16),
          }
        } catch (err) {
          testResults.crypto = { status: "error", error: String(err) }
        }

        // Test path
        try {
          const joined = safePath.join("folder", "subfolder", "file.txt")
          testResults.path = {
            status: "success",
            joined,
            basename: safePath.basename(joined),
            dirname: safePath.dirname(joined),
            extname: safePath.extname(joined),
          }
        } catch (err) {
          testResults.path = { status: "error", error: String(err) }
        }

        // Test buffer
        try {
          const buffer = safeBuffer.fromString("hello world")
          testResults.buffer = {
            status: "success",
            base64: safeBuffer.toString(buffer, "base64"),
            hex: safeBuffer.toString(buffer, "hex"),
            isBuffer: safeBuffer.isBuffer(buffer),
          }
        } catch (err) {
          testResults.buffer = { status: "error", error: String(err) }
        }

        // Test URL
        try {
          const parsed = safeUrl.parse("https://example.com/path?query=value#hash")
          testResults.url = {
            status: "success",
            parsed,
            formatted: safeUrl.format({
              protocol: "https",
              hostname: "example.com",
              pathname: "/test",
            }),
            resolved: safeUrl.resolve("https://example.com", "/relative/path"),
          }
        } catch (err) {
          testResults.url = { status: "error", error: String(err) }
        }

        setResults(testResults)
      } catch (err) {
        setError(String(err))
      } finally {
        setLoading(false)
      }
    }

    testPolyfills()
  }, [])

  if (loading) {
    return <div className="p-6">Testing Node.js polyfills...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Node.js Polyfill Test Results</h1>

      {Object.entries(results).map(([name, result]) => (
        <div key={name} className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {name}
            {result.status === "success" ? (
              <span className="text-green-500 text-sm">✓ Working</span>
            ) : (
              <span className="text-red-500 text-sm">✗ Failed</span>
            )}
          </h2>

          {result.status === "success" ? (
            <div className="mt-2 space-y-2">
              {Object.entries(result)
                .filter(([key]) => key !== "status")
                .map(([key, value]) => (
                  <div key={key} className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="font-medium">{key}:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm break-all">
                      {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                    </code>
                  </div>
                ))}
            </div>
          ) : (
            <div className="mt-2 text-red-500">
              <p>Error: {result.error}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
