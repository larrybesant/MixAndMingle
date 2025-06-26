"use client"

import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase/client"
import { UserListSchema, type UserList } from "@/lib/zod-schemas-shared"

export default function Page() {
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
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center py-6 px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {/* Neon Logo */}
          <div className="text-4xl font-black tracking-wider">
            <span className="text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.8)] font-extrabold">MIX</span>
            <span className="text-orange-400 text-5xl mx-2 drop-shadow-[0_0_15px_rgba(251,146,60,0.8)]">🎵</span>
            <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] font-extrabold">MINGLE</span>
          </div>
        </div>
        <Link
          href="/login"
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 text-white hover:bg-white/20 transition-all duration-300 font-semibold"
        >
          Sign In
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 text-center py-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
            <span className="block text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">Stream Live Content</span>
            <span className="block text-transparent bg-gradient-to-r from-orange-400 via-pink-400 to-cyan-400 bg-clip-text text-4xl md:text-5xl mt-4 font-bold">
              from Around the World
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Party from home with friends or solo. Join rooms. Go live. Connect with global vibes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link
              href="/discover"
              className="group relative bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-12 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_rgba(59,130,246,0.8)]"
            >
              <span className="relative z-10">Browse Rooms</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </Link>
            <Link
              href="/go-live"
              className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:shadow-[0_0_40px_rgba(147,51,234,0.8)]"
            >
              <span className="relative z-10">Go Live</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured User Hero Image */}
      <section className="relative z-10 px-6 mb-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
            <Image
              src="/hero-dj.jpg"
              alt="Featured Creator"
              width={1200}
              height={600}
              className="w-full h-80 md:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

            {/* Live Chat Bubble */}
            <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/20">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-cyan-400 font-bold text-lg">truegrooves</span>
              <span className="text-2xl">🔥</span>
              <span className="text-white/90 text-lg">Love this set!</span>
            </div>

            {/* Live Indicator */}
            <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
              <span>LIVE</span>
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
