export default function DashboardPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #000000 0%, #4c1d95 50%, #7c3aed 100%)",
      color: "white",
      padding: "2rem",
    }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>
        🎵 Mix & Mingle Dashboard
      </h1>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1.5rem",
      }}>
        <div style={{
          background: "rgba(255,255,255,0.1)",
          padding: "1.5rem",
          borderRadius: "1rem",
        }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Your Rooms</h2>
          <p>Create and manage your DJ rooms</p>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.1)",
          padding: "1.5rem",
          borderRadius: "1rem",
        }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Matches</h2>
          <p>Connect with fellow music lovers</p>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.1)",
          padding: "1.5rem",
          borderRadius: "1rem",
        }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Analytics</h2>
          <p>Track your streaming performance</p>
        </div>
      </div>
    </div>
  )
}
