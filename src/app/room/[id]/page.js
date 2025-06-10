export default function RoomPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #000000 0%, #4c1d95 50%, #7c3aed 100%)",
      color: "white",
      padding: "2rem",
    }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        🎥 DJ Room - 12 Webcam System
      </h1>
      <p style={{ marginBottom: "2rem" }}>Paltalk-style webcam system</p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "1rem",
        maxWidth: "1200px",
      }}>
        {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "0.5rem",
            padding: "1rem",
            textAlign: "center",
            aspectRatio: "16/9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            Webcam Slot {i}
          </div>
        ))}
      </div>
    </div>
  )
}
