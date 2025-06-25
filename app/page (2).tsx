"use client";

export default function BetaRoom() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <h1 className="text-3xl font-bold text-white mb-6">Beta DJ Room</h1>
      <iframe
        src="https://your-domain.daily.co/your-room-name"
        allow="camera; microphone; fullscreen; speaker; display-capture"
        style={{
          width: "90vw",
          height: "70vh",
          border: "0px",
          borderRadius: "16px",
          background: "#111",
        }}
        title="Daily.co Beta Room"
      />
      <p className="text-gray-400 mt-4">
        Share this link with DJs to test live video and audio.
      </p>
    </div>
  );
}
