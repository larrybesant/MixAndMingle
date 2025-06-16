"use client";

export default function GoLivePage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Go Live</h1>
      <div className="w-full max-w-3xl aspect-video rounded-xl overflow-hidden shadow-lg">
        <iframe
          src="https://mixandmingle.daily.co/onFsceKakRamUvWONG5y"
          allow="camera; microphone; fullscreen; speaker; display-capture"
          style={{ width: "100%", height: "500px", border: "none" }}
          title="Live DJ Room"
        />
      </div>
    </main>
  );
}
