const BetaInvitation = () => {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1 style={{ color: "#ff5500", margin: "0" }}>
          MIX <span style={{ color: "#0088ff" }}>&amp; MINGLE</span>
        </h1>
        <p style={{ color: "#666", fontSize: "16px", margin: "5px 0 0" }}>Beta Test Invitation</p>
      </div>

      <p>Hello [Name],</p>

      <p>
        We're excited to invite you to join the exclusive beta test for <strong>MIX &amp; MINGLE</strong>, a new
        platform that connects music lovers with live DJ streams, events, and a vibrant community of fellow enthusiasts.
      </p>

      <h2 style={{ color: "#0088ff", fontSize: "18px", marginTop: "25px" }}>What is MIX &amp; MINGLE?</h2>
      <p>MIX &amp; MINGLE is a social platform where you can:</p>
      <ul>
        <li>Watch live DJ sets from talented artists around the world</li>
        <li>Connect with friends and other music lovers</li>
        <li>Discover and join virtual and in-person music events</li>
        <li>Chat in real-time during streams and request your favorite songs</li>
        <li>Create your own DJ profile and broadcast your sets (if you're a DJ)</li>
      </ul>

      <h2 style={{ color: "#ff5500", fontSize: "18px", marginTop: "25px" }}>Why We Need Beta Testers</h2>
      <p>
        Before our public launch, we need feedback from music enthusiasts like you to ensure the platform delivers an
        exceptional experience. Your insights will directly shape the future of MIX &amp; MINGLE.
      </p>

      <h2 style={{ color: "#0088ff", fontSize: "18px", marginTop: "25px" }}>What We're Looking For</h2>
      <p>As a beta tester, we'd like you to:</p>
      <ul>
        <li>Explore the platform and test its features</li>
        <li>Join live streams and interact with DJs and other listeners</li>
        <li>Report any bugs or issues you encounter</li>
        <li>Provide feedback on the user experience</li>
        <li>Suggest improvements or new features</li>
      </ul>

      <h2 style={{ color: "#ff5500", fontSize: "18px", marginTop: "25px" }}>Beta Test Timeline</h2>
      <p>
        The beta test will run from [Start Date] to [End Date]. During this period, we'll be actively implementing
        improvements based on your feedback.
      </p>

      <div style={{ background: "#f0f8ff", padding: "15px", borderRadius: "5px", marginTop: "25px" }}>
        <h2 style={{ color: "#0088ff", fontSize: "18px", margin: "0 0 10px" }}>How to Join</h2>
        <ol style={{ margin: "0", paddingLeft: "20px" }}>
          <li>Click the "Join Beta" button below</li>
          <li>
            Create your account using the invitation code: <strong>MIXBETA2023</strong>
          </li>
          <li>Complete your profile</li>
          <li>Check out our Beta Tester Guide to get started</li>
        </ol>
      </div>

      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <a
          href="https://yourdomain.com/signup?beta=true"
          style={{
            display: "inline-block",
            background: "linear-gradient(to right, #ff5500, #0088ff)",
            color: "white",
            padding: "12px 25px",
            borderRadius: "25px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          JOIN BETA
        </a>
      </div>

      <h2 style={{ color: "#0088ff", fontSize: "18px", marginTop: "25px" }}>Beta Tester Benefits</h2>
      <ul>
        <li>Early access to all platform features</li>
        <li>Direct influence on the platform's development</li>
        <li>Special "Founding Member" badge on your profile when we launch</li>
        <li>Exclusive access to beta-only virtual events</li>
        <li>Priority access to new features as they're developed</li>
      </ul>

      <p style={{ marginTop: "25px" }}>
        We're looking for active participants who are passionate about music and community. The more you engage with the
        platform, the more valuable your feedback will be!
      </p>

      <p>
        If you have any questions about the beta test, please reply to this email or contact our support team at
        [support email].
      </p>

      <p>Thank you for considering joining our beta test. We're excited to build something amazing together!</p>

      <p>
        Best regards,
        <br />
        [Your Name]
        <br />
        MIX &amp; MINGLE Team
      </p>

      <div
        style={{
          borderTop: "1px solid #eee",
          marginTop: "30px",
          paddingTop: "15px",
          fontSize: "12px",
          color: "#999",
          textAlign: "center",
        }}
      >
        <p>This is a limited invitation. Please do not share your invitation code.</p>
        <p>MIX &amp; MINGLE | [Your Address] | [City, State ZIP]</p>
      </div>
    </div>
  )
}

export default BetaInvitation
