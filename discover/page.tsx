"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

export default function DiscoverPage() {
  const [users, setUsers] = useState<{ id: string; username: string }[]>([])

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase.from("profiles").select("id, username")
      setUsers(data || [])
    }
    fetchUsers()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Browse Live Rooms</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {users.length === 0 && <div className="text-gray-400">No users yet. Be the first to sign up!</div>}
        {users.map((user: { id: string; username: string }) => (
          <div key={user.id} className="bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col items-center">
            <div className="font-bold text-lg mb-2">{user.username}</div>
            <div className="text-gray-400 text-sm mb-2">Live soon...</div>
            <Link href={`/profile/${user.id}`} className="text-blue-400 hover:underline">
              View Profile
            </Link>
          </div>
        ))}
      </div>
    </main>
  )
}
