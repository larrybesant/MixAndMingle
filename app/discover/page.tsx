"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";

export default function DiscoverPage() {
  const [djs, setDjs] = useState<{ id: string; username: string }[]>([]);

  useEffect(() => {
    async function fetchDJs() {
      const { data } = await supabase.from("profiles").select("id, username");
      setDjs(data || []);
    }
    fetchDJs();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Browse DJ Rooms</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
    </main>
  );
}
