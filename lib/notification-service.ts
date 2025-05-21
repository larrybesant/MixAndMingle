import { db } from "@/lib/firebase-client-safe"
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  getDocs,
  writeBatch,
  type Timestamp,
  deleteDoc, // Import deleteDoc
} from "firebase/firestore"

export interface Notification {
  id: string
  userId: string
  type:
    | "message"
    | "mention"
    | "roomInvite"
    | "friendRequest"
    | "gift"
    | "system"
    | "like"
    | "comment"
    | "follow"
    | "share"
  title: string
  body: string
  image?: string
  read: boolean
  data?: {
    roomId?: string
    messageId?: string
    senderId?: string
    senderName?: string
    giftId?: string
    postId?: string
    commentId?: string
    [key: string]: any
  }
  createdAt: Timestamp | Date
}

class NotificationService {
  // Create a new notification
  async createNotification(notification: Omit<Notification, "id" | "createdAt" | "read">): Promise<string> {
    try {
      const notificationRef = await addDoc(collection(db, "notifications"), {
        ...notification,
        read: false,
        createdAt: serverTimestamp(),
      })

      return notificationRef.id
    } catch (error) {
      console.error("Error creating notification:", error)
      throw error
    }
  }

  // Get all notifications for a user
  subscribeToUserNotifications(userId: string, callback: (notifications: Notification[]) => void): () => void {
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(50),
    )

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notifications: Notification[] = []

      snapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() } as Notification)
      })

      callback(notifications)
    })

    return unsubscribe
  }

  // Mark a notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, "notifications", notificationId)
      await updateDoc(notificationRef, {
        read: true,
      })
    } catch (error) {
      console.error("Error marking notification as read:", error)
      throw error
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        where("read", "==", false),
      )

      const snapshot = await getDocs(notificationsQuery)

      if (snapshot.empty) return

      const batch = writeBatch(db)

      snapshot.forEach((doc) => {
        batch.update(doc.ref, { read: true })
      })

      await batch.commit()
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      throw error
    }
  }

  // Delete a notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, "notifications", notificationId)
      await deleteDoc(notificationRef) // Use deleteDoc
    } catch (error) {
      console.error("Error deleting notification:", error)
      throw error
    }
  }

  // Create a chat message notification
  async createChatMessageNotification(
    userId: string,
    senderName: string,
    senderImage: string | null,
    roomName: string,
    messageText: string,
    roomId: string,
    messageId: string,
    senderId: string,
  ): Promise<string> {
    return this.createNotification({
      userId,
      type: "message",
      title: `New message from ${senderName} in ${roomName}`,
      body: messageText.length > 50 ? `${messageText.substring(0, 50)}...` : messageText,
      image: senderImage || undefined,
      data: {
        roomId,
        messageId,
        senderId,
        senderName,
      },
    })
  }

  // Create a mention notification
  async createMentionNotification(
    userId: string,
    senderName: string,
    senderImage: string | null,
    roomName: string,
    messageText: string,
    roomId: string,
    messageId: string,
    senderId: string,
  ): Promise<string> {
    return this.createNotification({
      userId,
      type: "mention",
      title: `${senderName} mentioned you in ${roomName}`,
      body: messageText.length > 50 ? `${messageText.substring(0, 50)}...` : messageText,
      image: senderImage || undefined,
      data: {
        roomId,
        messageId,
        senderId,
        senderName,
      },
    })
  }

  // Create a room invite notification
  async createRoomInviteNotification(
    userId: string,
    senderName: string,
    senderImage: string | null,
    roomName: string,
    roomId: string,
    senderId: string,
  ): Promise<string> {
    return this.createNotification({
      userId,
      type: "roomInvite",
      title: `Room Invitation`,
      body: `${senderName} invited you to join ${roomName}`,
      image: senderImage || undefined,
      data: {
        roomId,
        senderId,
        senderName,
      },
    })
  }

  // Create a friend request notification
  async createFriendRequestNotification(
    userId: string,
    senderName: string,
    senderImage: string | null,
    senderId: string,
  ): Promise<string> {
    return this.createNotification({
      userId,
      type: "friendRequest",
      title: `Friend Request`,
      body: `${senderName} sent you a friend request`,
      image: senderImage || undefined,
      data: {
        senderId,
        senderName,
      },
    })
  }

  // Create a gift notification
  async createGiftNotification(
    userId: string,
    senderName: string,
    senderImage: string | null,
    giftName: string,
    giftImage: string,
    senderId: string,
    giftId: string,
  ): Promise<string> {
    return this.createNotification({
      userId,
      type: "gift",
      title: `You received a gift!`,
      body: `${senderName} sent you a ${giftName}`,
      image: giftImage,
      data: {
        senderId,
        senderName,
        giftId,
      },
    })
  }

  // Create a system notification
  async createSystemNotification(userId: string, title: string, body: string, image?: string): Promise<string> {
    return this.createNotification({
      userId,
      type: "system",
      title,
      body,
      image,
    })
  }

  // Create a like notification
  async createLikeNotification(
    userId: string,
    senderName: string,
    senderImage: string | null,
    postId: string,
    senderId: string,
    postPreview: string,
  ): Promise<string> {
    return this.createNotification({
      userId,
      type: "like",
      title: `New Like`,
      body: `${senderName} liked your post: "${postPreview.length > 30 ? postPreview.substring(0, 30) + "..." : postPreview}"`,
      image: senderImage || undefined,
      data: {
        postId,
        senderId,
        senderName,
      },
    })
  }

  // Create a comment notification
  async createCommentNotification(
    userId: string,
    senderName: string,
    senderImage: string | null,
    postId: string,
    commentId: string,
    senderId: string,
    commentText: string,
    postPreview: string,
  ): Promise<string> {
    return this.createNotification({
      userId,
      type: "comment",
      title: `New Comment`,
      body: `${senderName} commented on your post: "${commentText.length > 30 ? commentText.substring(0, 30) + "..." : commentText}"`,
      image: senderImage || undefined,
      data: {
        postId,
        commentId,
        senderId,
        senderName,
      },
    })
  }

  // Create a follow notification
  async createFollowNotification(
    userId: string,
    senderName: string,
    senderImage: string | null,
    senderId: string,
  ): Promise<string> {
    return this.createNotification({
      userId,
      type: "follow",
      title: `New Follower`,
      body: `${senderName} started following you`,
      image: senderImage || undefined,
      data: {
        senderId,
        senderName,
      },
    })
  }

  // Create a share notification
  async createShareNotification(
    userId: string,
    senderName: string,
    senderImage: string | null,
    postId: string,
    senderId: string,
    postPreview: string,
  ): Promise<string> {
    return this.createNotification({
      userId,
      type: "share",
      title: `Post Shared`,
      body: `${senderName} shared your post: "${postPreview.length > 30 ? postPreview.substring(0, 30) + "..." : postPreview}"`,
      image: senderImage || undefined,
      data: {
        postId,
        senderId,
        senderName,
      },
    })
  }
}

export const notificationService = new NotificationService()

// Helper function to check if a message contains a mention of a user
export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g
  const mentions: string[] = []
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1])
  }

  return mentions
}
