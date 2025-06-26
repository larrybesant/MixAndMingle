"use client"

import { useState } from "react"

export default function BareTestPage() {
  const [message, setMessage] = useState("If you can see this, React is working!")

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>Bare Test Page</h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>{message}</p>

      <button
        onClick={() => setMessage("✅ Button click works!")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0066cc",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Test Button
      </button>

      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <p style={{ fontSize: "0.9rem", color: "#888" }}>This page uses NO external imports except React basics.</p>
        <p style={{ fontSize: "0.9rem", color: "#888" }}>If this fails, there's a fundamental Next.js setup issue.</p>
      </div>
    </div>
  )
}
