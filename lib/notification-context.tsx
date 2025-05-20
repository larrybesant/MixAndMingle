"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { notificationService, type Notification } from "@/lib/notification-service"
import { fcmService } from "@/lib/fcm-service"
import { useToast } from "@/hooks/use-toast"

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  requestPushPermission: () => Promise<boolean>
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  requestPushPermission: async () => false,
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuth()
  const { toast } = useToast()

  // Subscribe to user notifications
  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    const unsubscribe = notificationService.subscribeToUserNotifications(user.uid, (newNotifications) => {
      setNotifications(newNotifications)
      setUnreadCount(newNotifications.filter((notification) => !notification.read).length)
    })

    return () => unsubscribe()
  }, [user])

  // Initialize FCM
  useEffect(() => {
    fcmService.initialize()
  }, [])

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark notification as read.",
      })
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return

    try {
      await notificationService.markAllAsRead(user.uid)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark all notifications as read.",
      })
    }
  }

  // Delete a notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId)
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete notification.",
      })
    }
  }

  // Request push notification permission
  const requestPushPermission = async (): Promise<boolean> => {
    if (!user) return false

    try {
      const token = await fcmService.requestPermissionAndGetToken(user.uid)
      return !!token
    } catch (error) {
      console.error("Error requesting push permission:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to enable push notifications.",
      })
      return false
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        requestPushPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
