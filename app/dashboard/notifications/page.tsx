"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, Bell, Check, Trash2 } from "lucide-react"
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/services/notification-service"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await getUserNotifications(user.uid, 100)
      setNotifications(data)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notification: any) => {
    if (!user || notification.is_read) return

    try {
      await markNotificationAsRead(notification.id, user.uid)
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return

    try {
      await markAllNotificationsAsRead(user.uid)
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const handleDeleteNotification = async (notification: any) => {
    if (!user) return

    try {
      await deleteNotification(notification.id, user.uid)
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "unread") {
      return !notification.is_read
    }
    return true
  })

  // Render notification content based on type
  const renderNotificationContent = (notification: any) => {
    const { type, content } = notification

    switch (type) {
      case "stream_started":
        return {
          title: "Stream Started",
          message: `${content.dj_name} started streaming "${content.stream_title}"`,
          link: `/streams/${content.stream_id}`,
          icon: <Bell className="h-5 w-5 text-blue-500" />,
        }
      case "new_follower":
        return {
          title: "New Follower",
          message: `${content.follower_name} started following you`,
          link: `/dj/${content.follower_id}`,
          icon: <Bell className="h-5 w-5 text-green-500" />,
        }
      case "stream_liked":
        return {
          title: "Stream Liked",
          message: `${content.user_name} liked your stream "${content.stream_title}"`,
          link: `/streams/${content.stream_id}`,
          icon: <Bell className="h-5 w-5 text-red-500" />,
        }
      default:
        return {
          title: "Notification",
          message: "You have a new notification",
          link: "#",
          icon: <Bell className="h-5 w-5" />,
        }
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Notifications</CardTitle>
          {notifications.some((n) => !n.is_read) && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2">
                  {notifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                <Badge variant="secondary" className="ml-2">
                  {notifications.filter((n) => !n.is_read).length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No notifications</h3>
                  <p className="text-muted-foreground mt-2">You don't have any notifications yet.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => {
                    const { title, message, link, icon } = renderNotificationContent(notification)
                    return (
                      <div key={notification.id}>
                        <div
                          className={`flex items-start justify-between p-4 rounded-lg hover:bg-muted ${
                            !notification.is_read ? "bg-muted/50" : ""
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="mt-0.5">{icon}</div>
                            <div>
                              <Link href={link} onClick={() => handleMarkAsRead(notification)}>
                                <h4 className={`text-sm font-medium ${!notification.is_read ? "font-semibold" : ""}`}>
                                  {title}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">{message}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </p>
                              </Link>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleMarkAsRead(notification)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteNotification(notification)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Separator />
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="unread" className="mt-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Check className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">All caught up!</h3>
                  <p className="text-muted-foreground mt-2">You have no unread notifications.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => {
                    const { title, message, link, icon } = renderNotificationContent(notification)
                    return (
                      <div key={notification.id}>
                        <div className="flex items-start justify-between p-4 rounded-lg hover:bg-muted bg-muted/50">
                          <div className="flex items-start gap-4">
                            <div className="mt-0.5">{icon}</div>
                            <div>
                              <Link href={link} onClick={() => handleMarkAsRead(notification)}>
                                <h4 className="text-sm font-semibold">{title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{message}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </p>
                              </Link>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleMarkAsRead(notification)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteNotification(notification)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Separator />
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
