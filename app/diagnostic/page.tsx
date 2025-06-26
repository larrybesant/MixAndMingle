"use client"

import { useState } from "react"

export default function DiagnosticPage() {
  const [testResults, setTestResults] = useState<Record<string, string>>({})
  const [currentTest, setCurrentTest] = useState("")

  const runTest = (testName: string, testFunction: () => void) => {
    setCurrentTest(testName)
    try {
      testFunction()
      setTestResults((prev) => ({ ...prev, [testName]: "✅ PASSED" }))
    } catch (error) {
      setTestResults((prev) => ({ ...prev, [testName]: `❌ FAILED: ${error}` }))
    }
  }

  const testAlert = () => {
    alert("Alert test successful!")
  }

  const testConsole = () => {
    console.log("Console test successful!")
    console.log("Check the browser console (F12) to see this message")
  }

  const testNavigation = () => {
    window.location.href = "/dashboard-fixed"
  }

  const testJavaScript = () => {
    const result = 2 + 2
    if (result === 4) {
      alert("JavaScript is working correctly!")
    } else {
      throw new Error("JavaScript calculation failed")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-white mb-6">🔍 DIAGNOSTIC TEST CENTER</h1>

          {/* Current Status */}
          <div className="mb-6 p-4 bg-gray-900/50 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-2">Current Status:</h2>
            <p className="text-gray-300">Testing: {currentTest || "Ready to start"}</p>
            <p className="text-gray-300">URL: {typeof window !== "undefined" ? window.location.href : "Loading..."}</p>
          </div>

          {/* Test Buttons */}
          <div className="space-y-4 mb-6">
            <h2 className="text-lg font-semibold text-white">Run Tests:</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => runTest("JavaScript Basic", testJavaScript)}
                className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
                style={{ pointerEvents: "auto" }}
              >
                Test JavaScript
              </button>

              <button
                onClick={() => runTest("Alert Dialog", testAlert)}
                className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer"
                style={{ pointerEvents: "auto" }}
              >
                Test Alert
              </button>

              <button
                onClick={() => runTest("Console Log", testConsole)}
                className="p-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg cursor-pointer"
                style={{ pointerEvents: "auto" }}
              >
                Test Console
              </button>

              <button
                onClick={() => runTest("Navigation", testNavigation)}
                className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer"
                style={{ pointerEvents: "auto" }}
              >
                Test Navigation
              </button>
            </div>
          </div>

          {/* Test Results */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">Test Results:</h2>
            <div className="space-y-2">
              {Object.entries(testResults).map(([test, result]) => (
                <div key={test} className="p-2 bg-gray-900/50 rounded">
                  <span className="text-white font-medium">{test}:</span>
                  <span className="ml-2 text-gray-300">{result}</span>
                </div>
              ))}
              {Object.keys(testResults).length === 0 && <p className="text-gray-400 italic">No tests run yet</p>}
            </div>
          </div>

          {/* Manual Check */}
          <div className="border-t border-gray-700 pt-4">
            <h2 className="text-lg font-semibold text-white mb-2">Manual Check:</h2>
            <div className="space-y-2 text-sm text-gray-300">
              <p>1. Can you see this diagnostic page clearly? ✅ Yes / ❌ No</p>
              <p>2. Are the buttons above clickable? ✅ Yes / ❌ No</p>
              <p>3. When you click buttons, do they change color? ✅ Yes / ❌ No</p>
              <p>4. Do you see any error messages? ✅ Yes / ❌ No</p>
            </div>
          </div>

          {/* Links to Other Pages */}
          <div className="border-t border-gray-700 pt-4 mt-6">
            <h2 className="text-lg font-semibold text-white mb-2">Quick Links:</h2>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/dashboard-fixed"
                className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-center"
              >
                Dashboard Fixed
              </a>
              <a href="/basic-html-test" className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-center">
                Basic HTML Test
              </a>
              <a href="/simple-test" className="p-2 bg-green-600 hover:bg-green-700 text-white rounded text-center">
                Simple Test
              </a>
              <a href="/button-test" className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-center">
                Button Test
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
