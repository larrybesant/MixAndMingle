"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import supabase from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Shield, Users, Radio, MessageSquare, LogOut, Settings, BarChart3 } from "lucide-react"

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeRooms: 0,
    totalMessages: 0,
    onlineUsers: 0,
  })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAdminAccess() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.replace("/admin")
        return
      }

      setUser(data.user)
      await loadDashboardData()
      setLoading(false)
    }

    checkAdminAccess()
  }, [router])

  const loadDashboardData = async () => {
    try {
      // Load statistics
      const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

      const { count: roomCount } = await supabase.from("dj_rooms").select("*", { count: "exact", head: true })

      const { count: messageCount } = await supabase.from("chat_messages").select("*", { count: "exact", head: true })

      // Load recent users
      const { data: users } = await supabase
        .from("profiles")
        .select("username, full_name, created_at")
        .order("created_at", { ascending: false })
        .limit(5)

      setStats({
        totalUsers: userCount || 0,
        activeRooms: roomCount || 0,
        totalMessages: messageCount || 0,
        onlineUsers: Math.floor(Math.random() * 50) + 10, // Simulated for demo
      })

      setRecentUsers(users || [])
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/admin")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Admin Dashboard...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 w-12 h-12 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-400">Mix & Mingle Control Center</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Welcome, {user?.email}</span>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                <p className="text-gray-400 text-sm">Total Users</p>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <Radio className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.activeRooms}</p>
                <p className="text-gray-400 text-sm">DJ Rooms</p>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <MessageSquare className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalMessages}</p>
                <p className="text-gray-400 text-sm">Messages</p>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <BarChart3 className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.onlineUsers}</p>
                <p className="text-gray-400 text-sm">Online Now</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Admin Controls */}
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Admin Controls
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white p-4 h-auto justify-start">
                <Users className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Manage Users</div>
                  <div className="text-sm opacity-80">View, edit, and moderate user accounts</div>
                </div>
              </Button>

              <Button className="bg-green-600 hover:bg-green-700 text-white p-4 h-auto justify-start">
                <Radio className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Manage DJ Rooms</div>
                  <div className="text-sm opacity-80">Monitor and control live streaming rooms</div>
                </div>
              </Button>

              <Button className="bg-purple-600 hover:bg-purple-700 text-white p-4 h-auto justify-start">
                <MessageSquare className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Message Moderation</div>
                  <div className="text-sm opacity-80">Review and moderate chat messages</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-6">Recent Users</h3>
            <div className="space-y-4">
              {recentUsers.length > 0 ? (
                recentUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="font-semibold text-white">{user.username || "Anonymous"}</p>
                      <p className="text-sm text-gray-400">{user.full_name || "No name set"}</p>
                    </div>
                    <div className="text-xs text-gray-500">{new Date(user.created_at).toLocaleDateString()}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No users yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Refresh Data
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Export Users
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Platform Settings
            </Button>
            <Button
              onClick={() => window.open("/", "_blank")}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              View Live Site
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
