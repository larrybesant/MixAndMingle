"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Check, MessageSquare, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotifications,
  type Notification,
} from "@/services/notification-service"

export default function NotificationsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return

      try {
        setLoading(true)
        const data = await getNotifications(user.uid)
        setNotifications(data)
      } catch (error) {
        console.error("Error fetching notifications:", error)
        // If no notifications exist yet, use empty array
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()

    // Subscribe to new notifications
    if (user) {
      const unsubscribe = subscribeToNotifications(user.uid, (newNotification) => {
        setNotifications((prev) => [newNotification, ...prev])

        // Show toast for new notification
        toast({
          title: newNotification.title,
          description: newNotification.content,
        })
      })

      return () => unsubscribe()
    }
  }, [user, toast])

  const getNotificationType = (title: string): "match" | "message" | "system" => {
    if (title.toLowerCase().includes("match")) return "match"
    if (title.toLowerCase().includes("message")) return "message"
    return "system"
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const success = await markNotificationAsRead(notificationId)

      if (success) {
        // Update local state
        setNotifications(
          notifications.map((notification) =>
            notification.id === notificationId ? { ...notification, is_read: true } : notification,
          ),
        )
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return

    try {
      const success = await markAllNotificationsAsRead(user.uid)

      if (success) {
        // Update local state
        setNotifications(
          notifications.map((notification) => ({
            ...notification,
            is_read: true,
          })),
        )

        toast({
          title: "All notifications marked as read",
          description: "All notifications have been marked as read.",
        })
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.is_read
    return getNotificationType(notification.title) === activeTab
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "match":
        return <Users className="h-5 w-5 text-primary" />
      case "message":
        return <MessageSquare className="h-5 w-5 text-primary" />
      default:
        return <Bell className="h-5 w-5 text-primary" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          {notifications.some((n) => !n.is_read) && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <p className="text-muted-foreground">Stay updated with your activity</p>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="match">Matches</TabsTrigger>
          <TabsTrigger value="message">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 bg-muted rounded" />
                        <div className="h-3 w-2/3 bg-muted rounded" />
                      </div>
                      <div className="h-8 w-8 bg-muted rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <Card key={notification.id} className={`transition-colors ${!notification.is_read ? "bg-muted/30" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getNotificationIcon(getNotificationType(notification.title))}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground">{notification.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(notification.created_at)}</p>
                    </div>
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Mark as read</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No notifications</h3>
              <p className="text-muted-foreground">
                You don't have any {activeTab !== "all" ? activeTab : ""} notifications at the moment.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
