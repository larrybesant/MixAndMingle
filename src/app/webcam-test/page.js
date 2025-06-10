export default function WebcamTestPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #000000 0%, #4c1d95 50%, #7c3aed 100%)",
      color: "white",
      padding: "2rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>
        🎥 Webcam Test
      </h1>
      <div style={{
        width: "640px",
        height: "360px",
        background: "rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "0.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "1rem",
      }}>
        <p>Webcam will appear here</p>
      </div>
      <button style={{
        padding: "0.75rem 1.5rem",
        background: "linear-gradient(45deg, #8b5cf6, #ec4899)",
        border: "none",
        borderRadius: "0.5rem",
        color: "white",
        fontSize: "1rem",
        fontWeight: "bold",
        cursor: "pointer",
      }}>
        Start Webcam (Coming Soon)
      </button>
    </div>
  )
}
