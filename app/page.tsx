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
    <main className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#1E1A36] to-[#18122B] text-white px-4 py-8 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div className="text-4xl font-extrabold tracking-tight">
          <span className="text-orange-400">MIX</span>
          <span className="mx-2 text-3xl text-orange-400 align-middle">🎵</span>
          <span className="text-indigo-400">MINGLE</span>
        </div>
        <nav className="flex gap-4">
          <Link href="/" className="border border-gray-400 px-5 py-2 rounded-lg text-gray-200 hover:bg-gray-800 transition">
            Home
          </Link>
          <Link href="/dashboard" className="border border-blue-400 px-5 py-2 rounded-lg text-blue-200 hover:bg-blue-800 transition">
            Dashboard
          </Link>
          <Link href="/go-live" className="border border-pink-400 px-5 py-2 rounded-lg text-pink-200 hover:bg-pink-800 transition">
            Go Live
          </Link>
          <Link href="/discover" className="border border-green-400 px-5 py-2 rounded-lg text-green-200 hover:bg-green-800 transition">
            Browse Rooms
          </Link>
          <Link href="/login" className="border border-gray-400 px-5 py-2 rounded-lg text-gray-200 hover:bg-gray-800 transition">
            Sign In
          </Link>
          <Link href="/signup" className="border border-pink-400 px-5 py-2 rounded-lg text-pink-200 hover:bg-pink-800 transition">
            Sign Up
          </Link>
          <Link href="/privacy-policy" className="text-gray-400 hover:underline px-2">Privacy</Link>
          <Link href="/terms" className="text-gray-400 hover:underline px-2">Terms</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-5xl font-extrabold mb-4">Stream Live DJs</h1>
        <p className="text-lg text-gray-300 mb-8">
          Join live DJ sets from around the world. Chat and mingle with other music lovers.
        </p>
        <div className="flex justify-center gap-6 mb-10">
          <Link href="/discover" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition">
            Browse Rooms
          </Link>
          <Link href="/go-live" className="bg-transparent border border-pink-500 text-pink-400 px-8 py-3 rounded-xl font-bold text-lg hover:bg-pink-900/20 transition">
            Go Live
          </Link>
        </div>
      </section>

      {/* Live DJ Rooms */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Live DJ Rooms</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {djs.length === 0 && (
            <div className="text-gray-400">No DJs yet. Be the first to sign up!</div>
          )}
          {djs.map((dj) => (
            <div key={dj.id} className="bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col items-center">
              <div className="font-bold text-lg mb-2">{dj.username}</div>
              <div className="text-gray-400 text-sm mb-2">Live soon...</div>
              <Link href={`/profile/${dj.id}`} className="text-blue-400 hover:underline">
                View Profile
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Create a Room */}
      <section className="text-center mb-10">
        <Link href="/go-live" className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:scale-105 transition">
          Create a Room
        </Link>
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
    </main>
  );
}