"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotifications,
} from "@/services/notification-service"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

export function NotificationsDropdown() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications()
    }
  }, [isOpen, user])

  // Subscribe to new notifications
  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToNotifications(user.uid, (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev])
      setUnreadCount((prev) => prev + 1)
    })

    return () => {
      unsubscribe()
    }
  }, [user])

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return

    try {
      const data = await getUserNotifications(user.uid)
      setNotifications(data)
      setUnreadCount(data.filter((n) => !n.is_read).length)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  // Mark notification as read
  const handleNotificationClick = async (notification: any) => {
    if (!user || notification.is_read) return

    try {
      await markNotificationAsRead(notification.id, user.uid)
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)))
      setUnreadCount((prev) => prev - 1)
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!user) return

    try {
      await markAllNotificationsAsRead(user.uid)
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  // Render notification content based on type
  const renderNotificationContent = (notification: any) => {
    const { type, content } = notification

    switch (type) {
      case "stream_started":
        return {
          message: `${content.dj_name} started streaming "${content.stream_title}"`,
          link: `/streams/${content.stream_id}`,
        }
      case "new_follower":
        return {
          message: `${content.follower_name} started following you`,
          link: `/dj/${content.follower_id}`,
        }
      case "stream_liked":
        return {
          message: `${content.user_name} liked your stream "${content.stream_title}"`,
          link: `/streams/${content.stream_id}`,
        }
      default:
        return {
          message: "New notification",
          link: "#",
        }
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-4 px-2 text-center text-muted-foreground">No notifications yet</div>
        ) : (
          notifications.slice(0, 5).map((notification) => {
            const { message, link } = renderNotificationContent(notification)
            return (
              <DropdownMenuItem
                key={notification.id}
                className={`py-2 px-4 cursor-pointer ${!notification.is_read ? "bg-muted/50" : ""}`}
                onClick={() => handleNotificationClick(notification)}
                asChild
              >
                <Link href={link}>
                  <div className="flex flex-col gap-1">
                    <p className={`text-sm ${!notification.is_read ? "font-medium" : ""}`}>{message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
            )
          })
        )}
        {notifications.length > 5 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/notifications" className="w-full text-center text-sm">
                View all notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
