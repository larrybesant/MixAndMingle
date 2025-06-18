"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";

export default function Page() {
  const [djs, setDjs] = useState<{ id: string; username: string }[]>([]);

  useEffect(() => {
    async function fetchDJs() {
      const { data } = await supabase.from("profiles").select("id, username");
      setDjs(data || []);
    }
    fetchDJs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] to-[#1F1D36] text-white">
      {/* Header - No borders */}
      <header className="flex justify-between items-center py-8 px-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-3xl font-bold">
          <span className="text-orange-400">MIX</span>
          <span className="mx-2 text-3xl text-orange-400 align-middle">🎵</span>
          <span className="text-indigo-400">MINGLE</span>
        </div>
        <button className="bg-white/10 backdrop-blur-sm rounded-lg px-5 py-2 text-white hover:bg-white/20 transition">
          Sign In
        </button>
      </header>

      {/* Hero - No borders */}
      <section className="flex flex-col items-center text-center py-16 px-4">
        <h1 className="text-5xl font-extrabold mb-4">Stream Live DJs</h1>
        <p className="text-lg text-gray-300 mb-8">
          Join live DJ sets from around the world. Chat and mingle with other music lovers.
        </p>
        <div className="flex gap-4 mb-12">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg">
            Browse Rooms
          </button>
          <button className="bg-fuchsia-500/20 text-fuchsia-300 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-fuchsia-500/30 transition backdrop-blur-sm">
            Go Live
          </button>
        </div>
      </section>

      {/* Featured DJ - No borders */}
      <section className="px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img src="/dj-featured.jpg" alt="Featured DJ" className="w-full h-72 object-cover" />
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2">
              <span className="text-blue-400 font-bold">truegrooves</span>
              <span className="text-yellow-400 text-lg">🔥</span>
              <span className="ml-3 text-white/80">Love this set!</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live DJ Rooms - No borders */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Live DJ Rooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Room 1 - No borders */}
            <div className="group cursor-pointer transform hover:scale-105 transition-all duration-300">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img src="/dj1.jpg" alt="Electronic Voyage" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="font-semibold text-lg text-white">Electronic Voyage</div>
                  <div className="text-white/70 text-sm mb-1">by selectors</div>
                  <div className="text-white/50 text-xs">120 viewers</div>
                </div>
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  LIVE
                </div>
              </div>
            </div>

            {/* Room 2 - No borders */}
            <div className="group cursor-pointer transform hover:scale-105 transition-all duration-300">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img src="/dj2.jpg" alt="Hip Hop Grooves" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="font-semibold text-lg text-white">Hip Hop Grooves</div>
                  <div className="text-white/70 text-sm mb-1">DJ FreshBeats</div>
                  <div className="text-white/50 text-xs">63 viewers</div>
                </div>
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  LIVE
                </div>
              </div>
            </div>

            {/* Room 3 - No borders */}
            <div className="group cursor-pointer transform hover:scale-105 transition-all duration-300">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img src="/dj3.jpg" alt="Soulful Sounds" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="font-semibold text-lg text-white">Soulful Sounds</div>
                  <div className="text-white/70 text-sm mb-1">DJ Harmony</div>
                  <div className="text-white/50 text-xs">78 viewers</div>
                </div>
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  LIVE
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Create a Room - No borders */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Go Live?</h2>
          <p className="text-white/70 text-lg mb-8">Share your music with the world</p>
          <button className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white px-12 py-4 text-xl font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300">
            Create a Room
          </button>
        </div>
      </section>

      {/* Join Live Room Button - New Section */}
      <section className="text-center">
        <Link
          href="https://mixandmingle.daily.co/onFsceKakRamUvWONG5y"
          target="_blank"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition block text-center mt-4"
        >
          Join Live Room
        </Link>
      </section>
    </div>
  );
}
