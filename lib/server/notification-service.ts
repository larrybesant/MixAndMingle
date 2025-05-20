import { getFirestore, getMessaging } from "@/lib/firebase-admin"
import type { MulticastMessage } from "firebase-admin/messaging"

// Notification types
export type NotificationType = "message" | "mention" | "roomInvite" | "friendRequest" | "gift" | "system"

// Notification data interface
export interface NotificationData {
  roomId?: string
  messageId?: string
  senderId?: string
  senderName?: string
  giftId?: string
  [key: string]: any
}

// Server-side notification service
export class ServerNotificationService {
  // Create a notification in Firestore
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: NotificationData,
    image?: string,
  ) {
    try {
      const db = getFirestore()

      // Create notification document
      const notificationRef = db.collection("notifications").doc()

      await notificationRef.set({
        userId,
        type,
        title,
        body,
        image,
        data,
        read: false,
        createdAt: new Date(),
      })

      return notificationRef.id
    } catch (error) {
      console.error("Error creating notification:", error)
      throw error
    }
  }

  // Send push notification to a user
  async sendPushNotification(userId: string, title: string, body: string, data?: NotificationData, image?: string) {
    try {
      const db = getFirestore()
      const messaging = getMessaging()

      // Get user's FCM tokens
      const userDoc = await db.collection("users").doc(userId).get()

      if (!userDoc.exists) {
        throw new Error(`User ${userId} not found`)
      }

      const userData = userDoc.data()
      const fcmTokens = userData?.fcmTokens || []

      if (fcmTokens.length === 0) {
        console.log(`No FCM tokens found for user ${userId}`)
        return { success: false, message: "No FCM tokens found" }
      }

      // Check user's notification preferences
      const preferences = userData?.notificationPreferences || {}
      const pushEnabled = preferences.pushEnabled !== false // Default to true if not set

      if (!pushEnabled) {
        console.log(`Push notifications disabled for user ${userId}`)
        return { success: false, message: "Push notifications disabled" }
      }

      // Create message
      const message: MulticastMessage = {
        notification: {
          title,
          body,
          imageUrl: image,
        },
        data: {
          ...(data || {}),
          notificationId: Math.random().toString(36).substring(2, 15),
          timestamp: Date.now().toString(),
        },
        tokens: fcmTokens,
        webpush: {
          fcmOptions: {
            link: this.getDeepLink(data),
          },
          notification: {
            icon: "/logo.png",
            badge: "/badge.png",
            vibrate: [100, 50, 100],
            actions: this.getNotificationActions(data?.type || "message"),
          },
        },
      }

      // Send message
      const response = await messaging.sendMulticast(message)

      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = []

        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(fcmTokens[idx])
          }
        })

        // Remove failed tokens
        if (failedTokens.length > 0) {
          const validTokens = fcmTokens.filter((token) => !failedTokens.includes(token))
          await db.collection("users").doc(userId).update({
            fcmTokens: validTokens,
          })

          console.log(`Removed ${failedTokens.length} invalid tokens for user ${userId}`)
        }
      }

      return {
        success: true,
        sent: response.successCount,
        failed: response.failureCount,
      }
    } catch (error) {
      console.error("Error sending push notification:", error)
      throw error
    }
  }

  // Create notification and send push in one operation
  async createAndSendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: NotificationData,
    image?: string,
  ) {
    try {
      // Create notification in database
      const notificationId = await this.createNotification(userId, type, title, body, data, image)

      // Send push notification
      const pushResult = await this.sendPushNotification(userId, title, body, { ...data, notificationId }, image)

      return {
        notificationId,
        push: pushResult,
      }
    } catch (error) {
      console.error("Error creating and sending notification:", error)
      throw error
    }
  }

  // Send notification to multiple users
  async sendBulkNotifications(
    userIds: string[],
    type: NotificationType,
    title: string,
    body: string,
    data?: NotificationData,
    image?: string,
  ) {
    const results = []

    for (const userId of userIds) {
      try {
        const result = await this.createAndSendNotification(userId, type, title, body, data, image)

        results.push({ userId, success: true, result })
      } catch (error) {
        console.error(`Error sending notification to user ${userId}:`, error)
        results.push({ userId, success: false, error: (error as Error).message })
      }
    }

    return results
  }

  // Get deep link URL based on notification data
  private getDeepLink(data?: NotificationData): string {
    if (!data) return "/dashboard"

    if (data.roomId) {
      if (data.messageId) {
        return `/dashboard/chat-rooms/${data.roomId}?message=${data.messageId}`
      }
      return `/dashboard/chat-rooms/${data.roomId}`
    }

    if (data.senderId) {
      return `/dashboard/profile/${data.senderId}`
    }

    return "/dashboard"
  }

  // Get notification actions based on type
  private getNotificationActions(type: string): { action: string; title: string }[] {
    switch (type) {
      case "message":
        return [
          { action: "reply", title: "Reply" },
          { action: "view", title: "View" },
        ]
      case "roomInvite":
        return [
          { action: "accept", title: "Accept" },
          { action: "decline", title: "Decline" },
        ]
      case "friendRequest":
        return [
          { action: "accept", title: "Accept" },
          { action: "decline", title: "Decline" },
        ]
      default:
        return [{ action: "view", title: "View" }]
    }
  }

  // Helper methods for specific notification types

  // Chat message notification
  async sendChatMessageNotification(
    userId: string,
    senderName: string,
    senderImage: string | null,
    roomName: string,
    messageText: string,
    roomId: string,
    messageId: string,
    senderId: string,
  ) {
    const title = `New message from ${senderName} in ${roomName}`
    const body = messageText.length > 50 ? `${messageText.substring(0, 50)}...` : messageText

    return this.createAndSendNotification(
      userId,
      "message",
      title,
      body,
      {
        roomId,
        messageId,
        senderId,
        senderName,
      },
      senderImage || undefined,
    )
  }

  // Mention notification
  async sendMentionNotification(
    userId: string,
    senderName: string,
    senderImage: string | null,
    roomName: string,
    messageText: string,
    roomId: string,
    messageId: string,
    senderId: string,
  ) {
    const title = `${senderName} mentioned you in ${roomName}`
    const body = messageText.length > 50 ? `${messageText.substring(0, 50)}...` : messageText

    return this.createAndSendNotification(
      userId,
      "mention",
      title,
      body,
      {
        roomId,
        messageId,
        senderId,
        senderName,
      },
      senderImage || undefined,
    )
  }

  // Room invite notification
  async sendRoomInviteNotification(
    userId: string,
    senderName: string,
    senderImage: string | null,
    roomName: string,
    roomId: string,
    senderId: string,
  ) {
    return this.createAndSendNotification(
      userId,
      "roomInvite",
      "Room Invitation",
      `${senderName} invited you to join ${roomName}`,
      {
        roomId,
        senderId,
        senderName,
      },
      senderImage || undefined,
    )
  }

  // Friend request notification
  async sendFriendRequestNotification(
    userId: string,
    senderName: string,
    senderImage: string | null,
    senderId: string,
  ) {
    return this.createAndSendNotification(
      userId,
      "friendRequest",
      "Friend Request",
      `${senderName} sent you a friend request`,
      {
        senderId,
        senderName,
      },
      senderImage || undefined,
    )
  }

  // Gift notification
  async sendGiftNotification(
    userId: string,
    senderName: string,
    senderImage: string | null,
    giftName: string,
    giftImage: string,
    senderId: string,
    giftId: string,
  ) {
    return this.createAndSendNotification(
      userId,
      "gift",
      "You received a gift!",
      `${senderName} sent you a ${giftName}`,
      {
        senderId,
        senderName,
        giftId,
      },
      giftImage,
    )
  }

  // System notification
  async sendSystemNotification(userId: string, title: string, body: string, image?: string) {
    return this.createAndSendNotification(userId, "system", title, body, {}, image)
  }
}

// Export singleton instance
export const serverNotificationService = new ServerNotificationService()
