import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { UserData as UserProfileData } from "./userProfile" // Declare UserData here

// Chat Room interfaces
export interface ChatRoom {
  id: string
  name: string
  description: string
  type: "public" | "private" | "premium"
  createdBy: string
  createdAt: Timestamp
  members: string[]
  memberCount: number
  lastMessage?: {
    text: string
    sender: string
    timestamp: Timestamp
  }
}

export interface Message {
  id: string
  roomId: string
  senderId: string
  senderName: string
  senderAvatar: string
  text: string
  timestamp: Timestamp
  type: "text" | "image" | "file"
}

// Video Room interfaces
export interface VideoRoom {
  id: string
  name: string
  hostId: string
  hostName: string
  type: "public" | "private" | "premium"
  participants: string[]
  maxParticipants: number
  isActive: boolean
  createdAt: Timestamp
  settings: {
    allowChat: boolean
    allowScreenShare: boolean
    requireApproval: boolean
  }
}

// Connection/Friend interfaces
export interface Connection {
  id: string
  userId1: string
  userId2: string
  status: "pending" | "accepted" | "blocked"
  createdAt: Timestamp
  acceptedAt?: Timestamp
}

// Chat Room functions
export const createChatRoom = async (roomData: Omit<ChatRoom, "id" | "createdAt" | "memberCount">) => {
  try {
    const docRef = await addDoc(collection(db, "chatRooms"), {
      ...roomData,
      createdAt: serverTimestamp(),
      memberCount: roomData.members.length,
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating chat room:", error)
    throw error
  }
}

export const getChatRooms = async (type?: "public" | "private" | "premium") => {
  try {
    let q = query(collection(db, "chatRooms"), orderBy("createdAt", "desc"))

    if (type) {
      q = query(collection(db, "chatRooms"), where("type", "==", type), orderBy("createdAt", "desc"))
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatRoom[]
  } catch (error) {
    console.error("Error getting chat rooms:", error)
    throw error
  }
}

export const joinChatRoom = async (roomId: string, userId: string) => {
  try {
    const roomRef = doc(db, "chatRooms", roomId)
    const roomDoc = await getDoc(roomRef)

    if (roomDoc.exists()) {
      const roomData = roomDoc.data() as ChatRoom
      if (!roomData.members.includes(userId)) {
        await updateDoc(roomRef, {
          members: [...roomData.members, userId],
          memberCount: roomData.members.length + 1,
        })
      }
    }
  } catch (error) {
    console.error("Error joining chat room:", error)
    throw error
  }
}

export const leaveChatRoom = async (roomId: string, userId: string) => {
  try {
    const roomRef = doc(db, "chatRooms", roomId)
    const roomDoc = await getDoc(roomRef)

    if (roomDoc.exists()) {
      const roomData = roomDoc.data() as ChatRoom
      const updatedMembers = roomData.members.filter((id) => id !== userId)
      await updateDoc(roomRef, {
        members: updatedMembers,
        memberCount: updatedMembers.length,
      })
    }
  } catch (error) {
    console.error("Error leaving chat room:", error)
    throw error
  }
}

// Message functions
export const sendMessage = async (messageData: Omit<Message, "id" | "timestamp">) => {
  try {
    const docRef = await addDoc(collection(db, "messages"), {
      ...messageData,
      timestamp: serverTimestamp(),
    })

    // Update room's last message
    const roomRef = doc(db, "chatRooms", messageData.roomId)
    await updateDoc(roomRef, {
      lastMessage: {
        text: messageData.text,
        sender: messageData.senderName,
        timestamp: serverTimestamp(),
      },
    })

    return docRef.id
  } catch (error) {
    console.error("Error sending message:", error)
    throw error
  }
}

export const getMessages = (roomId: string, callback: (messages: Message[]) => void) => {
  const q = query(collection(db, "messages"), where("roomId", "==", roomId), orderBy("timestamp", "asc"), limit(100))

  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[]
    callback(messages)
  })
}

// Video Room functions
export const createVideoRoom = async (roomData: Omit<VideoRoom, "id" | "createdAt" | "isActive">) => {
  try {
    const docRef = await addDoc(collection(db, "videoRooms"), {
      ...roomData,
      createdAt: serverTimestamp(),
      isActive: true,
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating video room:", error)
    throw error
  }
}

export const getActiveVideoRooms = async () => {
  try {
    const q = query(collection(db, "videoRooms"), where("isActive", "==", true), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as VideoRoom[]
  } catch (error) {
    console.error("Error getting video rooms:", error)
    throw error
  }
}

export const joinVideoRoom = async (roomId: string, userId: string) => {
  try {
    const roomRef = doc(db, "videoRooms", roomId)
    const roomDoc = await getDoc(roomRef)

    if (roomDoc.exists()) {
      const roomData = roomDoc.data() as VideoRoom
      if (!roomData.participants.includes(userId) && roomData.participants.length < roomData.maxParticipants) {
        await updateDoc(roomRef, {
          participants: [...roomData.participants, userId],
        })
      }
    }
  } catch (error) {
    console.error("Error joining video room:", error)
    throw error
  }
}

export const leaveVideoRoom = async (roomId: string, userId: string) => {
  try {
    const roomRef = doc(db, "videoRooms", roomId)
    const roomDoc = await getDoc(roomRef)

    if (roomDoc.exists()) {
      const roomData = roomDoc.data() as VideoRoom
      const updatedParticipants = roomData.participants.filter((id) => id !== userId)

      if (updatedParticipants.length === 0) {
        // Close room if no participants
        await updateDoc(roomRef, {
          participants: updatedParticipants,
          isActive: false,
        })
      } else {
        await updateDoc(roomRef, {
          participants: updatedParticipants,
        })
      }
    }
  } catch (error) {
    console.error("Error leaving video room:", error)
    throw error
  }
}

// Connection functions
export const sendFriendRequest = async (fromUserId: string, toUserId: string) => {
  try {
    const docRef = await addDoc(collection(db, "connections"), {
      userId1: fromUserId,
      userId2: toUserId,
      status: "pending",
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error sending friend request:", error)
    throw error
  }
}

export const acceptFriendRequest = async (connectionId: string) => {
  try {
    const connectionRef = doc(db, "connections", connectionId)
    await updateDoc(connectionRef, {
      status: "accepted",
      acceptedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error accepting friend request:", error)
    throw error
  }
}

export const getUserConnections = async (userId: string) => {
  try {
    const q1 = query(collection(db, "connections"), where("userId1", "==", userId), where("status", "==", "accepted"))

    const q2 = query(collection(db, "connections"), where("userId2", "==", userId), where("status", "==", "accepted"))

    const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)])

    const connections = [
      ...snapshot1.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ...snapshot2.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    ] as Connection[]

    return connections
  } catch (error) {
    console.error("Error getting user connections:", error)
    throw error
  }
}

// User profile functions
export const updateUserProfile = async (userId: string, updates: Partial<UserProfileData>) => {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, updates)
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

export const updateUserStats = async (userId: string, statType: keyof UserProfileData["stats"], increment = 1) => {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfileData
      const currentValue = userData.stats[statType] || 0

      await updateDoc(userRef, {
        [`stats.${statType}`]: currentValue + increment,
      })
    }
  } catch (error) {
    console.error("Error updating user stats:", error)
    throw error
  }
}
