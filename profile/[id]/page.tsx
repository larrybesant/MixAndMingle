"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import Link from "next/link";

export default function DJProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [profile, setProfile] = useState<{ username: string } | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase.from("profiles").select("username").eq("id", id).single();
      setProfile(data);
    }
    if (id) fetchProfile();
  }, [id]);

  if (!profile) return <div className="text-white p-8">Loading...</div>;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">{profile.username}</h1>
      <div className="text-gray-400 mb-8">DJ Profile</div>
      {/* Add more DJ info here as you expand */}
      <Link
        href="https://mixandmingle.daily.co/onFsceKakRamUvWONG5y"
        target="_blank"
        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition block text-center mt-4"
      >
        Join Live Room
      </Link>
    </main>
  );
}
