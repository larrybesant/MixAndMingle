"use client"

import { useState, useEffect } from "react"

export default function EnvTestPage() {
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl: boolean
    supabaseKey: boolean
    nodeEnv: string
  }>({
    supabaseUrl: false,
    supabaseKey: false,
    nodeEnv: "unknown",
  })

  useEffect(() => {
    setEnvStatus({
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV || "unknown",
    })
  }, [])

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "black",
        color: "white",
        padding: "20px",
        fontFamily: "monospace",
      }}
    >
      <h1>Environment Variables Test</h1>

      <div style={{ marginTop: "20px" }}>
        <h2>Environment Status:</h2>
        <ul>
          <li>NODE_ENV: {envStatus.nodeEnv}</li>
          <li>SUPABASE_URL: {envStatus.supabaseUrl ? "✅ Set" : "❌ Missing"}</li>
          <li>SUPABASE_ANON_KEY: {envStatus.supabaseKey ? "✅ Set" : "❌ Missing"}</li>
        </ul>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>Raw Values (first 20 chars):</h2>
        <ul>
          <li>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20)}...</li>
          <li>SUPABASE_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</li>
        </ul>
      </div>
    </div>
  )
}
