"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase/client"
import { UserListSchema, type UserList } from "@/lib/zod-schemas-shared"

export default function Page() {
  const [, setUsers] = useState<UserList>([])

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase.from("profiles").select("id, username")
      // Validate and filter users at runtime
      const parsed = UserListSchema.safeParse(data || [])
      if (parsed.success) {
        setUsers(parsed.data)
      } else {
        setUsers([])
        // Optionally log or show error
        // console.error("Invalid user data", parsed.error)
      }
    }
    fetchUsers()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-orange-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-pink-400 rounded-full animate-ping"></div>
      </div>      {/* Header */}
      <header className="relative z-10 flex justify-between items-center py-6 px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {/* Neon Logo */}          <div className="text-4xl font-black tracking-wider">
            <span className="text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.8)] font-extrabold">MIX</span>
            <span className="text-orange-400 text-5xl mx-2 drop-shadow-[0_0_15px_rgba(251,146,60,0.8)] font-serif transform rotate-6 inline-block">𝄞</span>
            <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] font-extrabold">MINGLE</span>          </div>
        </div>
          {/* Auth Buttons */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/login"
            className="text-white hover:text-cyan-400 font-semibold text-sm sm:text-lg transition-colors duration-300 px-3 sm:px-4 py-2 rounded-lg hover:bg-white/10"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(251,146,60,0.4)] hover:shadow-[0_0_30px_rgba(251,146,60,0.6)]"
          >
            Sign Up
          </Link>
        </div>
      </header>      {/* Hero Section */}
      <section className="relative z-10 text-center py-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Main Headline - More User-Friendly */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="block text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">Connect Through Music</span>
            <span className="block text-transparent bg-gradient-to-r from-orange-400 via-pink-400 to-cyan-400 bg-clip-text text-3xl md:text-4xl mt-4 font-bold">
              Dating • Streaming • Community
            </span>
          </h1>

          {/* Better Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Find love through shared music taste. Stream together. Date. Make friends. All in one place.
          </p>

          {/* Value Proposition */}
          <div className="flex flex-wrap justify-center gap-4 mb-12 text-sm md:text-base">
            <span className="bg-purple-600/20 text-purple-300 px-4 py-2 rounded-full border border-purple-500/30">
              🎵 Music-Based Matching
            </span>
            <span className="bg-pink-600/20 text-pink-300 px-4 py-2 rounded-full border border-pink-500/30">
              💝 Dating & Romance
            </span>
            <span className="bg-cyan-600/20 text-cyan-300 px-4 py-2 rounded-full border border-cyan-500/30">
              🎪 Live Streaming
            </span>
          </div>          {/* Improved CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link
              href="/signup"
              className="group relative bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-700 hover:to-orange-600 text-white px-12 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:shadow-[0_0_40px_rgba(236,72,153,0.8)]"
            >
              <span className="relative z-10">💕 Start Dating Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-orange-300 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </Link>
            <Link
              href="/discover"
              className="group relative bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-12 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_rgba(59,130,246,0.8)]"
            >
              <span className="relative z-10">🎵 Explore Music</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </Link>
          </div>          {/* Secondary CTA */}
          <div className="text-center mb-8">
            <p className="text-gray-400 mb-4">Already have an account?</p>
            <Link
              href="/login"
              className="text-cyan-400 hover:text-cyan-300 font-semibold text-lg underline decoration-2 underline-offset-4 transition-colors duration-300"
            >
              Sign In Here →
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - New! */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-12 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Why Mix & Mingle?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="text-center p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl border border-purple-500/20 backdrop-blur-sm">
              <div className="text-6xl mb-4">💝</div>
              <h3 className="text-2xl font-bold text-white mb-4">Music-Based Dating</h3>
              <p className="text-gray-300 leading-relaxed">
                Match with people who share your music taste. Compatible vibes lead to real connections.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-3xl border border-blue-500/20 backdrop-blur-sm">
              <div className="text-6xl mb-4">🎪</div>
              <h3 className="text-2xl font-bold text-white mb-4">Live Streaming</h3>
              <p className="text-gray-300 leading-relaxed">
                Stream your music sessions, join virtual parties, and connect with your community in real-time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-3xl border border-green-500/20 backdrop-blur-sm">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-white mb-4">Safe Community</h3>
              <p className="text-gray-300 leading-relaxed">
                LGBTQ+ friendly, kink-positive space where everyone can express their authentic selves safely.
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="text-center bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-white/10">
            <p className="text-2xl text-white mb-4 font-semibold">Join thousands finding love through music</p>
            <div className="flex justify-center items-center gap-8 text-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🎵</span>
                <span>50K+ Songs Shared</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">💕</span>
                <span>1K+ Matches Made</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">🎪</span>
                <span>500+ Live Streams</span>
              </div>
            </div>
          </div>
        </div>
      </section>      {/* Featured User Hero Image */}
      <section className="relative z-10 px-6 mb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-8 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            See It In Action
          </h2>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
            <Image
              src="/hero-dj.jpg"
              alt="Live Music Stream - Connect Through Music"
              width={1200}
              height={600}
              className="w-full h-80 md:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            {/* Simplified Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

            {/* Simple Live Indicator */}
            <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              LIVE STREAM
            </div>

            {/* Call to Action Overlay */}
            <div className="absolute bottom-6 left-6 right-6 text-center">
              <p className="text-white text-xl font-bold mb-4">Experience live music together</p>
              <Link
                href="/signup"
                className="inline-block bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
              >
                Join Now - It's Free!
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live User Rooms */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-12 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Live Rooms
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Room 1 */}
            <div className="group cursor-pointer transform hover:scale-105 transition-all duration-500">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-900/50 to-purple-900/50 border border-cyan-500/30">
                <div className="aspect-square bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
                      <span className="text-3xl">🎧</span>
                    </div>
                    <div className="text-white font-bold text-xl mb-2">Electronic Journey</div>
                    <div className="text-cyan-200 text-sm">@Synthwave</div>
                  </div>
                </div>
                <div className="p-6 bg-black/40 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-semibold">129 viewers</span>
                    </div>
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                      LIVE
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Room 2 */}
            <div className="group cursor-pointer transform hover:scale-105 transition-all duration-500">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30">
                <div className="aspect-square bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
                      <span className="text-3xl">🎵</span>
                    </div>
                    <div className="text-white font-bold text-xl mb-2">Rhythmic Beats</div>
                    <div className="text-pink-200 text-sm">@Bassline</div>
                  </div>
                </div>
                <div className="p-6 bg-black/40 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-semibold">69 viewers</span>
                    </div>
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                      LIVE
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Room 3 */}
            <div className="group cursor-pointer transform hover:scale-105 transition-all duration-500">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-green-900/50 to-blue-900/50 border border-green-500/30">
                <div className="aspect-square bg-gradient-to-br from-green-600 via-teal-600 to-blue-600 p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
                      <span className="text-3xl">🎶</span>
                    </div>
                    <div className="text-white font-bold text-xl mb-2">Groove Session</div>
                    <div className="text-green-200 text-sm">@Melody</div>
                  </div>
                </div>
                <div className="p-6 bg-black/40 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-semibold">78 viewers</span>
                    </div>
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                      LIVE
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Create Room CTA */}
      <section className="relative z-10 text-center py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Create a Room
          </h2>
          <p className="text-xl text-gray-300 mb-8">Ready to share your content with the world?</p>
          <Link
            href="/go-live"
            className="group relative inline-block bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 text-white px-16 py-5 rounded-3xl font-black text-2xl transition-all duration-300 transform hover:scale-105 shadow-[0_0_40px_rgba(251,146,60,0.6)] hover:shadow-[0_0_60px_rgba(251,146,60,0.8)]"
          >
            <span className="relative z-10">Go Live Now</span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-300 to-purple-400 rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
          </Link>
        </div>
      </section>

      {/* Join Live Room Button */}
      <section className="relative z-10 text-center pb-20">
        <Link
          href="https://mixandmingle.daily.co/onFsceKakRamUvWONG5y"
          target="_blank"
          className="inline-block bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white px-12 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:shadow-[0_0_40px_rgba(34,197,94,0.8)]"
        >
          🔴 Join Live Room
        </Link>
      </section>

      {/* Bottom Glow Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-900/20 to-transparent"></div>
    </div>
  )
}
