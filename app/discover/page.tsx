"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

export default function DiscoverPage() {
  const [relationshipFilter, setRelationshipFilter] = useState("");
  const [users, setUsers] = useState<{ id: string; username: string; relationship_style?: string }[]>([])

  useEffect(() => {
    async function fetchUsers() {
      let query = supabase.from("profiles").select("id, username, relationship_style, is_dating_visible");
      if (relationshipFilter) {
        query = query.eq("relationship_style", relationshipFilter);
      }
      // Only show users who opted in to dating
      query = query.eq("is_dating_visible", true);
      const { data } = await query;
      setUsers(data || []);
    }
    fetchUsers();
  }, [relationshipFilter])

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Browse Live Rooms</h1>
      <div className="mb-6">
        <label className="text-white mr-2">Filter by Relationship Style:</label>
        <select
          className="p-2 rounded bg-gray-700 text-white"
          value={relationshipFilter}
          onChange={e => setRelationshipFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="traditional">Traditional/Monogamous</option>
          <option value="poly">Polyamorous</option>
          <option value="open">Open</option>
          <option value="queerplatonic">Queerplatonic</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {users.length === 0 && <div className="text-gray-400">No users yet. Be the first to sign up!</div>}
        {users.map((user) => (
          <div key={user.id} className="bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col items-center">
            <div className="font-bold text-lg mb-2">{user.username}</div>
            <div className="text-gray-400 text-sm mb-2">{user.relationship_style ? user.relationship_style.charAt(0).toUpperCase() + user.relationship_style.slice(1) : "Not set"}</div>
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
