"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface DJ {
  id: string
  username: string
}

export default function HomePage() {
  const [djs, setDjs] = useState<DJ[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading DJs
    setTimeout(() => {
      setDjs([
        { id: "1", username: "DJ Pulse" },
        { id: "2", username: "MC Flow" },
        { id: "3", username: "DJ Zen" },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Mix & Mingle...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] to-[#1F1D36] text-white px-4 pb-16">
      {/* Header */}
      <header className="flex justify-between items-center py-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-3xl font-bold">
          <span className="text-orange-400">MIX</span>
          <span className="text-orange-400 text-2xl">&</span>
          <span className="text-indigo-400">MINGLE</span>
        </div>
        <button className="border border-white/30 rounded-lg px-5 py-2 text-white hover:bg-white/10 transition">
          Sign In
        </button>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center mt-8">
        <h1 className="text-5xl font-extrabold mb-4">Stream Live DJs</h1>
        <p className="text-lg text-white/70 mb-8 max-w-xl">
          Join live DJ sets from around the world. Chat and mingle with other music lovers.
        </p>
        <div className="flex gap-4 mb-12">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow">
            Browse Rooms
          </button>
          <button className="border border-fuchsia-500 text-fuchsia-300 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-fuchsia-900/20 transition">
            Go Live
          </button>
        </div>
      </section>

      {/* Featured DJ */}
      <section className="max-w-3xl mx-auto mb-12">
        <div className="relative rounded-3xl overflow-hidden shadow-lg">
          <img
            src="/dj-featured.jpg"
            alt="Featured DJ"
            className="w-full h-72 object-cover"
          />
          <div className="absolute top-4 right-4 bg-[#232046]/80 px-4 py-2 rounded-xl flex items-center gap-2">
            <span className="text-blue-400 font-bold">truegrooves</span>
            <span className="text-yellow-400 text-lg">🔥</span>
            <span className="ml-3 text-white/80">Love this set!</span>
          </div>
        </div>
      </section>

      {/* Live DJ Rooms */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Live DJ Rooms</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Room 1 */}
          <div className="bg-[#232046] rounded-2xl overflow-hidden shadow-lg">
            <img
              src="/dj1.jpg"
              alt="Electronic Voyage"
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <div className="font-semibold text-lg">Electronic Voyage</div>
              <div className="text-white/60 text-sm mb-2">by selectors</div>
              <div className="text-white/50 text-xs">120 viewers</div>
            </div>
          </div>
          {/* Room 2 */}
          <div className="bg-[#232046] rounded-2xl overflow-hidden shadow-lg">
            <img
              src="/dj2.jpg"
              alt="Hip Hop Grooves"
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <div className="font-semibold text-lg">Hip Hop Grooves</div>
              <div className="text-white/60 text-sm mb-2">DJ FreshBeats</div>
              <div className="text-white/50 text-xs">63 viewers</div>
            </div>
          </div>
          {/* Room 3 */}
          <div className="bg-[#232046] rounded-2xl overflow-hidden shadow-lg">
            <img
              src="/dj3.jpg"
              alt="Soulful Sounds"
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <div className="font-semibold text-lg">Soulful Sounds</div>
              <div className="text-white/60 text-sm mb-2">DJ Harmony</div>
              <div className="text-white/50 text-xs">78 viewers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Create a Room (placeholder) */}
      <section className="max-w-5xl mx-auto mt-16">
        <h2 className="text-xl font-bold mb-4">Create a Room</h2>
        {/* Add your create room form or button here */}
      </section>
    </div>
  )
}
