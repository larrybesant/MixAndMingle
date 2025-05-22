import { initializeFirebase } from "@/lib/firebase/firebase-client"
import { getDatabase, ref, onValue, set, onDisconnect, serverTimestamp, off } from "firebase/database"

// Initialize Firebase and get the Realtime Database instance
export const getRealtimeDb = () => {
  const app = initializeFirebase()
  return getDatabase(app)
}

// User presence utilities
export const userPresence = {
  // Connect and set up presence for a user
  connect: (userId: string) => {
    const db = getRealtimeDb()
    const userStatusRef = ref(db, `/status/${userId}`)
    const userPresenceRef = ref(db, `/presence/${userId}`)

    // When this device disconnects, update the user's status
    onDisconnect(userStatusRef).set({
      state: "offline",
      lastChanged: serverTimestamp(),
    })

    onDisconnect(userPresenceRef).remove()

    // Set the user as online
    set(userStatusRef, {
      state: "online",
      lastChanged: serverTimestamp(),
    })

    // Mark the user as present
    set(userPresenceRef, true)

    return () => {
      // Clean up
      off(userStatusRef)
      off(userPresenceRef)
    }
  },

  // Disconnect and mark user as offline
  disconnect: (userId: string) => {
    const db = getRealtimeDb()
    const userStatusRef = ref(db, `/status/${userId}`)
    const userPresenceRef = ref(db, `/presence/${userId}`)

    // Set the user as offline
    set(userStatusRef, {
      state: "offline",
      lastChanged: serverTimestamp(),
    })

    // Remove presence
    set(userPresenceRef, null)
  },
}

// Room presence utilities
export const roomPresence = {
  // Join a room
  join: (roomId: string, userId: string, userData: any = {}) => {
    const db = getRealtimeDb()
    const roomUserRef = ref(db, `/rooms/${roomId}/presence/${userId}`)

    // When this device disconnects, remove the user from the room
    onDisconnect(roomUserRef).remove()

    // Add the user to the room with their data
    set(roomUserRef, {
      ...userData,
      joinedAt: serverTimestamp(),
    })

    return () => {
      // Clean up
      off(roomUserRef)
    }
  },

  // Leave a room
  leave: (roomId: string, userId: string) => {
    const db = getRealtimeDb()
    const roomUserRef = ref(db, `/rooms/${roomId}/presence/${userId}`)

    // Remove the user from the room
    set(roomUserRef, null)
  },

  // Get all users in a room
  getUsers: (roomId: string, callback: (users: any) => void) => {
    const db = getRealtimeDb()
    const roomPresenceRef = ref(db, `/rooms/${roomId}/presence`)

    // Listen for changes to the room's presence
    const unsubscribe = onValue(roomPresenceRef, (snapshot) => {
      const users = snapshot.val() || {}
      callback(users)
    })

    return unsubscribe
  },
}

// DJ activity tracking
export const djActivity = {
  // Track DJ activity
  trackActivity: (userId: string, activityType: string, metadata: any = {}) => {
    const db = getRealtimeDb()
    const activityRef = ref(db, `/dj_activity/${userId}/${Date.now()}`)

    // Record the activity
    set(activityRef, {
      type: activityType,
      timestamp: serverTimestamp(),
      ...metadata,
    })
  },

  // Get recent DJ activity
  getRecentActivity: (userId: string, limit: number, callback: (activities: any[]) => void) => {
    const db = getRealtimeDb()
    const activityRef = ref(db, `/dj_activity/${userId}`)

    // Listen for changes to the DJ's activity
    const unsubscribe = onValue(activityRef, (snapshot) => {
      const activities = snapshot.val() || {}

      // Convert to array and sort by timestamp (newest first)
      const activityArray = Object.entries(activities)
        .map(([key, value]) => ({ id: key, ...(value as any) }))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit)

      callback(activityArray)
    })

    return unsubscribe
  },
}

// Room stats tracking
export const roomStats = {
  // Update room stats
  updateStats: (roomId: string, stats: any) => {
    const db = getRealtimeDb()
    const statsRef = ref(db, `/room_stats/${roomId}`)

    // Update the stats
    set(statsRef, {
      ...stats,
      lastUpdated: serverTimestamp(),
    })
  },

  // Get room stats
  getStats: (roomId: string, callback: (stats: any) => void) => {
    const db = getRealtimeDb()
    const statsRef = ref(db, `/room_stats/${roomId}`)

    // Listen for changes to the room's stats
    const unsubscribe = onValue(statsRef, (snapshot) => {
      const stats = snapshot.val() || {}
      callback(stats)
    })

    return unsubscribe
  },
}
