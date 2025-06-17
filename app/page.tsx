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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4 py-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <div className="text-4xl font-extrabold tracking-tight">
          <span className="text-orange-400">MIX</span>
          <span className="mx-2 text-3xl text-orange-400 align-middle">🎵</span>
          <span className="text-indigo-400">MINGLE</span>
        </div>
        <nav className="flex flex-wrap gap-2 md:gap-4">
          <Link
            href="/"
            className="border border-gray-400 px-3 py-2 rounded-lg text-gray-200 hover:bg-gray-800 transition text-sm"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="border border-blue-400 px-3 py-2 rounded-lg text-blue-200 hover:bg-blue-800 transition text-sm"
          >
            Dashboard
          </Link>
          <Link
            href="/go-live"
            className="border border-pink-400 px-3 py-2 rounded-lg text-pink-200 hover:bg-pink-800 transition text-sm"
          >
            Go Live
          </Link>
          <Link
            href="/discover"
            className="border border-green-400 px-3 py-2 rounded-lg text-green-200 hover:bg-green-800 transition text-sm"
          >
            Browse
          </Link>
          <Link
            href="/login"
            className="border border-gray-400 px-3 py-2 rounded-lg text-gray-200 hover:bg-gray-800 transition text-sm"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="border border-pink-400 px-3 py-2 rounded-lg text-pink-200 hover:bg-pink-800 transition text-sm"
          >
            Sign Up
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Stream Live DJs
        </h1>
        <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
          Join live DJ sets from around the world. Chat and mingle with other music lovers in real-time.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
          <Link
            href="/discover"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition"
          >
            Browse Rooms
          </Link>
          <Link
            href="/go-live"
            className="bg-transparent border border-pink-500 text-pink-400 px-8 py-3 rounded-xl font-bold text-lg hover:bg-pink-900/20 transition"
          >
            Go Live
          </Link>
        </div>
      </section>

      {/* Live DJ Rooms */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-center">Live DJ Rooms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {djs.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-12">
              <p className="text-xl mb-4">No DJs online right now</p>
              <p>Be the first to go live!</p>
            </div>
          ) : (
            djs.map((dj) => (
              <div
                key={dj.id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700 hover:border-purple-500/50 transition-all"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎧</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-white">{dj.username}</h3>
                  <div className="text-gray-400 text-sm mb-4">
                    <span className="inline-flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Live Now
                    </span>
                  </div>
                  <Link
                    href={`/profile/${dj.id}`}
                    className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition"
                  >
                    Join Room
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Why Mix & Mingle?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Experience the future of social music streaming with real-time interaction and discovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎵</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Live DJ Streaming</h3>
            <p className="text-gray-400">Stream your sets live to a global audience with high-quality audio.</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Social Discovery</h3>
            <p className="text-gray-400">Connect with like-minded music lovers and discover new artists.</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Real-time Chat</h3>
            <p className="text-gray-400">Chat, react, and engage with DJs and listeners in real-time.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center">
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Mix & Mingle?</h3>
          <p className="text-gray-400 mb-6">Join the community and start your musical journey today.</p>
          <Link
            href="/signup"
            className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:scale-105 transition"
          >
            Get Started
          </Link>
        </div>
      </section>
    </main>
  )
}
