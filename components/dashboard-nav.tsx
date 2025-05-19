"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Users, MessageSquare, Bell, Settings, Music, Headphones, Radio, Calendar, User } from "lucide-react"

export function DashboardNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: <Users className="h-4 w-4 mr-2" />,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/explore",
      label: "Explore",
      icon: <Users className="h-4 w-4 mr-2" />,
      active: pathname === "/dashboard/explore",
    },
    {
      href: "/dashboard/matches",
      label: "Matches",
      icon: <Users className="h-4 w-4 mr-2" />,
      active: pathname === "/dashboard/matches",
    },
    {
      href: "/dashboard/messages",
      label: "Messages",
      icon: <MessageSquare className="h-4 w-4 mr-2" />,
      active: pathname.startsWith("/dashboard/messages"),
    },
    {
      href: "/dashboard/music-taste",
      label: "Music Taste",
      icon: <Music className="h-4 w-4 mr-2" />,
      active: pathname === "/dashboard/music-taste",
    },
    {
      href: "/dashboard/streams",
      label: "Live Streams",
      icon: <Radio className="h-4 w-4 mr-2" />,
      active: pathname.startsWith("/dashboard/streams"),
    },
    {
      href: "/dashboard/dj-profile",
      label: "DJ Profile",
      icon: <Headphones className="h-4 w-4 mr-2" />,
      active: pathname === "/dashboard/dj-profile",
    },
    {
      href: "/dashboard/events",
      label: "Events",
      icon: <Calendar className="h-4 w-4 mr-2" />,
      active: pathname.startsWith("/dashboard/events"),
    },
    {
      href: "/dashboard/notifications",
      label: "Notifications",
      icon: <Bell className="h-4 w-4 mr-2" />,
      active: pathname === "/dashboard/notifications",
    },
    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: <User className="h-4 w-4 mr-2" />,
      active: pathname === "/dashboard/profile",
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4 mr-2" />,
      active: pathname === "/dashboard/settings",
    },
  ]

  return (
    <nav className="grid gap-1">
      {routes.map((route) => (
        <Button
          key={route.href}
          variant={route.active ? "default" : "ghost"}
          className={cn(
            "justify-start",
            route.active ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-400 hover:text-white",
          )}
          asChild
        >
          <Link href={route.href}>
            {route.icon}
            {route.label}
          </Link>
        </Button>
      ))}
    </nav>
  )
}
