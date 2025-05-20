// Types
export interface NotificationData {
  roomId?: string
  messageId?: string
  senderId?: string
  senderName?: string
  giftId?: string
  [key: string]: any
}

// API client for notifications
export class NotificationApi {
  // Send a generic notification
  static async sendNotification(
    userId: string,
    type: string,
    title: string,
    body: string,
    data?: NotificationData,
    image?: string,
  ) {
    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          type,
          title,
          body,
          data,
          image,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send notification")
      }

      return response.json()
    } catch (error) {
      console.error("Error sending notification:", error)
      throw error
    }
  }

  // Send chat message notifications
  static async sendChatMessageNotifications(
    roomId: string,
    messageId: string,
    senderId: string,
    senderName: string,
    messageText: string,
    excludeUserIds: string[] = [],
  ) {
    try {
      const response = await fetch("/api/notifications/chat-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId,
          messageId,
          senderId,
          senderName,
          messageText,
          excludeUserIds,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send chat message notifications")
      }

      return response.json()
    } catch (error) {
      console.error("Error sending chat message notifications:", error)
      throw error
    }
  }

  // Send mention notifications
  static async sendMentionNotifications(
    roomId: string,
    messageId: string,
    senderId: string,
    senderName: string,
    messageText: string,
    mentionedUsernames: string[],
  ) {
    try {
      const response = await fetch("/api/notifications/mention", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId,
          messageId,
          senderId,
          senderName,
          messageText,
          mentionedUsernames,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send mention notifications")
      }

      return response.json()
    } catch (error) {
      console.error("Error sending mention notifications:", error)
      throw error
    }
  }

  // Send room invite notifications
  static async sendRoomInviteNotifications(roomId: string, senderId: string, invitedUserIds: string[]) {
    try {
      const response = await fetch("/api/notifications/room-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId,
          senderId,
          invitedUserIds,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send room invite notifications")
      }

      return response.json()
    } catch (error) {
      console.error("Error sending room invite notifications:", error)
      throw error
    }
  }

  // Send friend request notification
  static async sendFriendRequestNotification(senderId: string, receiverId: string) {
    try {
      const response = await fetch("/api/notifications/friend-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId,
          receiverId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send friend request notification")
      }

      return response.json()
    } catch (error) {
      console.error("Error sending friend request notification:", error)
      throw error
    }
  }

  // Send gift notification
  static async sendGiftNotification(senderId: string, receiverId: string, giftId: string) {
    try {
      const response = await fetch("/api/notifications/gift", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId,
          receiverId,
          giftId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send gift notification")
      }

      return response.json()
    } catch (error) {
      console.error("Error sending gift notification:", error)
      throw error
    }
  }

  // Send system notifications
  static async sendSystemNotifications(userIds: string[], title: string, body: string, image?: string) {
    try {
      const response = await fetch("/api/notifications/system", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds,
          title,
          body,
          image,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send system notifications")
      }

      return response.json()
    } catch (error) {
      console.error("Error sending system notifications:", error)
      throw error
    }
  }
}
