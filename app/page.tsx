"use client";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f051d] via-[#1a103a] to-[#1a103a] text-white font-sans px-4 pb-16">
      {/* Logo and Sign In */}
      <header className="flex justify-between items-center pt-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-4xl font-extrabold text-orange-400">MIX</span>
          <span className="text-3xl">🎼</span>
          <span className="text-4xl font-extrabold text-indigo-400">MINGLE</span>
        </div>
        <Button variant="outline" className="border-indigo-400 text-indigo-200 hover:bg-indigo-900">Sign In</Button>
      </header>
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center mt-12 mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">Stream Live DJs</h1>
        <p className="text-lg md:text-xl text-indigo-200 mb-8 max-w-2xl">Join live DJ sets from around the world. Chat and mingle with other music lovers.</p>
        <div className="flex gap-4 mb-10">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 text-lg font-bold shadow-lg">Browse Rooms</Button>
          <Button variant="outline" className="border-pink-400 text-pink-200 hover:bg-pink-900 px-8 py-3 text-lg font-bold">Go Live</Button>
        </div>
        {/* Featured DJ Image Section */}
        <div className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl mb-8 relative bg-gradient-to-tr from-[#1a103a] to-[#2d1a5a]">
          <div className="h-64 md:h-80 flex items-center justify-center">
            <img src="/dj-featured.jpg" alt="Featured DJ" className="w-full h-full object-cover" />
          </div>
          <div className="absolute top-4 right-4 bg-[#1a103a]/80 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-blue-400 font-bold">truegrooves</span>
            <span role="img" aria-label="fire">🔥</span>
            <span className="text-indigo-100">Love this set!</span>
          </div>
        </div>
      </section>
      {/* Live DJ Rooms */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Live DJ Rooms</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-tr from-[#1a103a] to-[#2d1a5a] p-0 overflow-hidden">
            <div className="h-40 bg-blue-900 flex items-center justify-center">
              <img src="/dj1.jpg" alt="Electronic Voyage" className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <div className="font-bold text-lg">Electronic Voyage</div>
              <div className="text-indigo-200 text-sm mb-1">by selectors</div>
              <div className="text-indigo-300 text-xs">120 viewers</div>
              <div className="text-indigo-400 text-xs mt-1">🎵 Electronic</div>
            </div>
          </Card>
          <Card className="bg-gradient-to-tr from-[#1a103a] to-[#2d1a5a] p-0 overflow-hidden">
            <div className="h-40 bg-pink-900 flex items-center justify-center">
              <img src="/dj2.jpg" alt="Hip Hop Grooves" className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <div className="font-bold text-lg">Hip Hop Grooves</div>
              <div className="text-indigo-200 text-sm mb-1">DJ FreshBeats</div>
              <div className="text-indigo-300 text-xs">63 viewers</div>
              <div className="text-indigo-400 text-xs mt-1">🎵 Hip Hop</div>
            </div>
          </Card>
          <Card className="bg-gradient-to-tr from-[#1a103a] to-[#2d1a5a] p-0 overflow-hidden">
            <div className="h-40 bg-yellow-900 flex items-center justify-center">
              <img src="/dj3.jpg" alt="Soulful Sounds" className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <div className="font-bold text-lg">Soulful Sounds</div>
              <div className="text-indigo-200 text-sm mb-1">DJ Harmony</div>
              <div className="text-indigo-300 text-xs">78 viewers</div>
              <div className="text-indigo-400 text-xs mt-1">🎵 Soul</div>
            </div>
          </Card>
        </div>
      </section>
      <style jsx global>{`
        body {
          background: #0f051d;
        }
      `}</style>
    </div>
  );
}
