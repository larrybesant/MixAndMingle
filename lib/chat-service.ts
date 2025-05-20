import { db, storage } from "@/lib/firebase"
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
  getDoc,
  arrayUnion,
  arrayRemove,
  getDocs,
  type Timestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { v4 as uuidv4 } from "uuid"
import { notificationService, extractMentions } from "@/lib/notification-service"

export interface ChatMessage {
  id: string
  text?: string
  mediaUrl?: string
  mediaType?: "image" | "audio" | "gif"
  senderId: string
  senderName: string
  senderPhotoURL?: string
  timestamp: Timestamp | Date
  reactions?: Record<string, string[]> // emoji -> array of userIds
  replyToId?: string
  isDeleted?: boolean
}

export interface ChatRoom {
  id: string
  name: string
  description?: string
  type: "public" | "private" | "direct"
  createdBy: string
  createdAt: Timestamp | Date
  members: string[]
  lastMessage?: {
    text: string
    senderId: string
    timestamp: Timestamp | Date
  }
  isActive: boolean
}

class ChatService {
  // Create a new chat room
  async createRoom(roomData: Omit<ChatRoom, "id" | "createdAt">): Promise<string> {
    try {
      const roomRef = await addDoc(collection(db, "rooms"), {
        ...roomData,
        createdAt: serverTimestamp(),
      })

      return roomRef.id
    } catch (error) {
      console.error("Error creating chat room:", error)
      throw error
    }
  }

  // Get a chat room by ID
  async getRoom(roomId: string): Promise<ChatRoom | null> {
    try {
      const roomDoc = await getDoc(doc(db, "rooms", roomId))

      if (roomDoc.exists()) {
        return { id: roomDoc.id, ...roomDoc.data() } as ChatRoom
      }

      return null
    } catch (error) {
      console.error("Error getting chat room:", error)
      throw error
    }
  }

  // Get all rooms a user is a member of
  subscribeToUserRooms(userId: string, callback: (rooms: ChatRoom[]) => void): () => void {
    const roomsQuery = query(
      collection(db, "rooms"),
      where("members", "array-contains", userId),
      where("isActive", "==", true),
      orderBy("createdAt", "desc"),
    )

    const unsubscribe = onSnapshot(roomsQuery, (snapshot) => {
      const rooms: ChatRoom[] = []

      snapshot.forEach((doc) => {
        rooms.push({ id: doc.id, ...doc.data() } as ChatRoom)
      })

      callback(rooms)
    })

    return unsubscribe
  }

  // Subscribe to messages in a room
  subscribeToMessages(roomId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const messagesQuery = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("timestamp", "asc"),
      limit(100), // Limit to last 100 messages
    )

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messages: ChatMessage[] = []

      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as ChatMessage)
      })

      callback(messages)
    })

    return unsubscribe
  }

  // Send a text message
  async sendMessage(roomId: string, message: Omit<ChatMessage, "id" | "timestamp">): Promise<string> {
    try {
      // Add message to room
      const messageRef = await addDoc(collection(db, "rooms", roomId, "messages"), {
        ...message,
        timestamp: serverTimestamp(),
      })

      // Update room's last message
      await updateDoc(doc(db, "rooms", roomId), {
        lastMessage: {
          text: message.text || "Shared media",
          senderId: message.senderId,
          timestamp: serverTimestamp(),
        },
      })

      // Get room data to create notifications
      const room = await this.getRoom(roomId)

      if (room) {
        // Create notifications for all members except sender
        const membersToNotify = room.members.filter((memberId) => memberId !== message.senderId)

        // Check for mentions in the message
        const mentionedUsers: string[] = []

        if (message.text) {
          // Extract mentions from text
          const mentions = extractMentions(message.text)

          if (mentions.length > 0) {
            // Query users with matching display names
            const usersQuery = query(collection(db, "users"), where("displayName", "in", mentions))

            const userSnapshot = await getDocs(usersQuery)

            userSnapshot.forEach((doc) => {
              const userData = doc.data()
              if (userData.uid !== message.senderId) {
                mentionedUsers.push(userData.uid)

                // Create mention notification
                notificationService.createMentionNotification(
                  userData.uid,
                  message.senderName,
                  message.senderPhotoURL || null,
                  room.name,
                  message.text || "",
                  roomId,
                  messageRef.id,
                  message.senderId,
                )
              }
            })
          }
        }

        // Send regular message notifications to members who weren't mentioned
        const regularNotifyMembers = membersToNotify.filter((memberId) => !mentionedUsers.includes(memberId))

        for (const memberId of regularNotifyMembers) {
          notificationService.createChatMessageNotification(
            memberId,
            message.senderName,
            message.senderPhotoURL || null,
            room.name,
            message.text || "Shared media",
            roomId,
            messageRef.id,
            message.senderId,
          )
        }
      }

      return messageRef.id
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  }

  // Upload and send a media message (image, audio, gif)
  async sendMediaMessage(
    roomId: string,
    file: File,
    mediaType: "image" | "audio" | "gif",
    senderId: string,
    senderName: string,
    senderPhotoURL?: string,
  ): Promise<string> {
    try {
      // Upload file to Firebase Storage
      const fileId = uuidv4()
      const fileExtension = file.name.split(".").pop()
      const storagePath = `chat-media/${roomId}/${fileId}.${fileExtension}`
      const storageRef = ref(storage, storagePath)

      await uploadBytes(storageRef, file)
      const mediaUrl = await getDownloadURL(storageRef)

      // Create message with media URL
      const message: Omit<ChatMessage, "id" | "timestamp"> = {
        mediaUrl,
        mediaType,
        senderId,
        senderName,
        senderPhotoURL,
      }

      return this.sendMessage(roomId, message)
    } catch (error) {
      console.error("Error sending media message:", error)
      throw error
    }
  }

  // Add a reaction to a message
  async addReaction(roomId: string, messageId: string, userId: string, emoji: string): Promise<void> {
    try {
      const messageRef = doc(db, "rooms", roomId, "messages", messageId)
      const messageDoc = await getDoc(messageRef)

      if (messageDoc.exists()) {
        const reactions = messageDoc.data().reactions || {}
        const emojiReactions = reactions[emoji] || []

        // Only add reaction if user hasn't already reacted with this emoji
        if (!emojiReactions.includes(userId)) {
          await updateDoc(messageRef, {
            [`reactions.${emoji}`]: arrayUnion(userId),
          })

          // Get message data to create notification
          const messageData = messageDoc.data() as ChatMessage

          // Don't notify if user is reacting to their own message
          if (messageData.senderId !== userId) {
            // Get user data
            const userDoc = await getDoc(doc(db, "users", userId))
            const userData = userDoc.data()

            // Get room data
            const room = await this.getRoom(roomId)

            if (userData && room) {
              // Create notification for message sender
              notificationService.createNotification({
                userId: messageData.senderId,
                type: "message",
                title: "New reaction",
                body: `${userData.displayName || "Someone"} reacted with ${emoji} to your message in ${room.name}`,
                image: userData.photoURL || undefined,
                data: {
                  roomId,
                  messageId,
                  senderId: userId,
                  senderName: userData.displayName,
                },
              })
            }
          }
        }
      }
    } catch (error) {
      console.error("Error adding reaction:", error)
      throw error
    }
  }

  // Remove a reaction from a message
  async removeReaction(roomId: string, messageId: string, userId: string, emoji: string): Promise<void> {
    try {
      const messageRef = doc(db, "rooms", roomId, "messages", messageId)

      await updateDoc(messageRef, {
        [`reactions.${emoji}`]: arrayRemove(userId),
      })
    } catch (error) {
      console.error("Error removing reaction:", error)
      throw error
    }
  }

  // Delete a message (soft delete)
  async deleteMessage(roomId: string, messageId: string): Promise<void> {
    try {
      const messageRef = doc(db, "rooms", roomId, "messages", messageId)

      await updateDoc(messageRef, {
        isDeleted: true,
        text: "This message has been deleted",
      })
    } catch (error) {
      console.error("Error deleting message:", error)
      throw error
    }
  }

  // Create or get a direct message room between two users
  async getOrCreateDirectMessageRoom(user1Id: string, user2Id: string): Promise<string> {
    try {
      // Check if a DM room already exists between these users
      const roomsQuery = query(
        collection(db, "rooms"),
        where("type", "==", "direct"),
        where("members", "array-contains", user1Id),
      )

      const snapshot = await getDocs(roomsQuery)

      let existingRoom = null

      snapshot.forEach((doc) => {
        const roomData = doc.data()
        if (roomData.members.includes(user2Id)) {
          existingRoom = { id: doc.id, ...roomData }
        }
      })

      if (existingRoom) {
        return existingRoom.id
      }

      // Get user data for both users
      const user1Doc = await getDoc(doc(db, "users", user1Id))
      const user2Doc = await getDoc(doc(db, "users", user2Id))

      if (!user1Doc.exists() || !user2Doc.exists()) {
        throw new Error("One or both users do not exist")
      }

      const user1Data = user1Doc.data()
      const user2Data = user2Doc.data()

      // Create a new DM room
      const roomData: Omit<ChatRoom, "id" | "createdAt"> = {
        name: `${user1Data.displayName} & ${user2Data.displayName}`,
        type: "direct",
        createdBy: user1Id,
        members: [user1Id, user2Id],
        isActive: true,
      }

      const roomId = await this.createRoom(roomData)

      // Create notification for the invited user
      notificationService.createNotification({
        userId: user2Id,
        type: "message",
        title: "New conversation",
        body: `${user1Data.displayName} started a conversation with you`,
        image: user1Data.photoURL || undefined,
        data: {
          roomId,
          senderId: user1Id,
          senderName: user1Data.displayName,
        },
      })

      return roomId
    } catch (error) {
      console.error("Error creating direct message room:", error)
      throw error
    }
  }

  // Invite a user to a room
  async inviteUserToRoom(roomId: string, userId: string, inviterId: string): Promise<void> {
    try {
      const roomRef = doc(db, "rooms", roomId)
      const roomDoc = await getDoc(roomRef)

      if (!roomDoc.exists()) {
        throw new Error("Room does not exist")
      }

      const roomData = roomDoc.data() as ChatRoom

      // Check if user is already a member
      if (roomData.members.includes(userId)) {
        return
      }

      // Add user to room members
      await updateDoc(roomRef, {
        members: arrayUnion(userId),
      })

      // Get inviter data
      const inviterDoc = await getDoc(doc(db, "users", inviterId))

      if (inviterDoc.exists()) {
        const inviterData = inviterDoc.data()

        // Create room invite notification
        notificationService.createRoomInviteNotification(
          userId,
          inviterData.displayName || "Someone",
          inviterData.photoURL || null,
          roomData.name,
          roomId,
          inviterId,
        )
      }
    } catch (error) {
      console.error("Error inviting user to room:", error)
      throw error
    }
  }

  // Subscribe to user presence
  subscribeToUserPresence(userIds: string[], callback: (presenceData: Record<string, string>) => void): () => void {
    // Create a map to store presence status for each user
    const presenceData: Record<string, string> = {}

    // Create an array to store unsubscribe functions
    const unsubscribeFunctions: (() => void)[] = []

    // Subscribe to each user's presence
    userIds.forEach((userId) => {
      const userRef = doc(db, "users", userId)

      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data()
          presenceData[userId] = userData.onlineStatus || "offline"
          callback(presenceData)
        }
      })

      unsubscribeFunctions.push(unsubscribe)
    })

    // Return a function that unsubscribes from all listeners
    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe())
    }
  }
}

export const chatService = new ChatService()
