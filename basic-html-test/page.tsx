"use client"

export default function BasicHtmlTest() {
  return (
    <div style={{ padding: "20px", backgroundColor: "white", color: "black", minHeight: "100vh" }}>
      <h1>BASIC HTML TEST</h1>
      <p>If you can see this text, the page is loading.</p>

      <button
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "blue",
          color: "white",
          border: "none",
          margin: "10px",
          cursor: "pointer",
        }}
        onClick={() => alert("BUTTON WORKS!")}
      >
        CLICK ME - TEST BUTTON
      </button>

      <br />

      <button
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "red",
          color: "white",
          border: "none",
          margin: "10px",
          cursor: "pointer",
        }}
        onClick={() => (window.location.href = "/dashboard")}
      >
        GO TO DASHBOARD
      </button>

      <p>Current URL: {typeof window !== "undefined" ? window.location.href : "Loading..."}</p>
    </div>
  )
}
