export default function HomePage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #000000 0%, #4c1d95 50%, #7c3aed 100%)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
    }}>
      <h1 style={{
        fontSize: "3rem",
        fontWeight: "bold",
        background: "linear-gradient(45deg, #ec4899, #8b5cf6, #06b6d4)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}>
        Mix & Mingle
      </h1>
      <p style={{ fontSize: "1.5rem", marginTop: "1rem" }}>
        Where Music Meets Connection
      </p>
    </div>
  )
}
