"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
import { useAuth } from "@/lib/auth-context"
import { MessageSquare, Video, Gift, CreditCard, User, Settings, LogOut } from "lucide-react"

export function DashboardNav() {
  const pathname = usePathname()
  const { logout } = useAuth()

  const routes = [
    {
      href: "/dashboard",
      icon: <User className="h-5 w-5" />,
      text: "Home",
    },
    {
      href: "/dashboard/chat-rooms",
      icon: <MessageSquare className="h-5 w-5" />,
      text: "Chat Rooms",
    },
    {
      href: "/dashboard/video-rooms",
      icon: <Video className="h-5 w-5" />,
      text: "Video Rooms",
    },
    {
      href: "/dashboard/gifts",
      icon: <Gift className="h-5 w-5" />,
      text: "Gifts",
    },
    {
      href: "/dashboard/subscription",
      icon: <CreditCard className="h-5 w-5" />,
      text: "Subscription",
    },
    {
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
      text: "Settings",
    },
  ]

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="font-bold text-xl">
          Mix & Mingle
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === route.href || pathname?.startsWith(`${route.href}/`)
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
            >
              {route.icon}
              {route.text}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
        <Button variant="ghost" size="icon" onClick={() => logout()}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
