export default function SignupPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #000000 0%, #4c1d95 50%, #7c3aed 100%)",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.1)",
        padding: "2rem",
        borderRadius: "1rem",
        width: "400px",
      }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "2rem", textAlign: "center" }}>
          Join Mix & Mingle
        </h1>
        <form>
          <input
            type="email"
            placeholder="Email"
            style={{
              width: "100%",
              padding: "0.75rem",
              marginBottom: "1rem",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "0.5rem",
              color: "white",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            style={{
              width: "100%",
              padding: "0.75rem",
              marginBottom: "1rem",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "0.5rem",
              color: "white",
            }}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            style={{
              width: "100%",
              padding: "0.75rem",
              marginBottom: "1rem",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "0.5rem",
              color: "white",
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "linear-gradient(45deg, #8b5cf6, #ec4899)",
              border: "none",
              borderRadius: "0.5rem",
              color: "white",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  )
}
