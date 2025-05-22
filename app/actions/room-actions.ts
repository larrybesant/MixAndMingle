"use server"

import { revalidatePath } from "next/cache"
import { getFirebaseFirestore } from "@/lib/firebase/firebase-admin"
import { redis } from "@/lib/redis-client"

interface Room {
  id: string
  name: string
  category: string
  djName: string
  viewers: number
}

/**
 * Fetches rooms with Redis caching
 */
export async function getRooms(): Promise<Room[]> {
  try {
    // Try to get from Redis cache first
    const cachedRooms = await redis.get("cache:rooms")

    if (cachedRooms) {
      console.log("Returning rooms from cache")
      return JSON.parse(cachedRooms as string)
    }

    // If not in cache, fetch from Firestore
    console.log("Fetching rooms from Firestore")
    const firestore = getFirebaseFirestore()
    const roomsSnapshot = await firestore.collection("rooms").get()

    const rooms = roomsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Room[]

    // Cache the result in Redis for 5 minutes
    await redis.set("cache:rooms", JSON.stringify(rooms), { ex: 300 })

    return rooms
  } catch (error) {
    console.error("Error fetching rooms:", error)
    throw new Error("Failed to fetch rooms")
  }
}

/**
 * Creates a new room
 */
export async function createRoom(formData: FormData): Promise<Room> {
  try {
    const name = formData.get("name") as string
    const category = formData.get("category") as string
    const djName = formData.get("djName") as string

    if (!name || !category || !djName) {
      throw new Error("Missing required fields")
    }

    const firestore = getFirebaseFirestore()

    const roomData = {
      name,
      category,
      djName,
      viewers: 0,
      createdAt: new Date().toISOString(),
    }

    const docRef = await firestore.collection("rooms").add(roomData)
    const newRoom = { id: docRef.id, ...roomData } as Room

    // Invalidate the cache
    await redis.del("cache:rooms")

    // Revalidate the rooms page
    revalidatePath("/rooms")

    return newRoom
  } catch (error) {
    console.error("Error creating room:", error)
    throw new Error("Failed to create room")
  }
}

/**
 * Gets a room by ID with Redis caching
 */
export async function getRoomById(id: string): Promise<Room | null> {
  try {
    // Try to get from Redis cache first
    const cachedRoom = await redis.get(`cache:room:${id}`)

    if (cachedRoom) {
      console.log("Returning room from cache")
      return JSON.parse(cachedRoom as string)
    }

    // If not in cache, fetch from Firestore
    console.log("Fetching room from Firestore")
    const firestore = getFirebaseFirestore()
    const roomDoc = await firestore.collection("rooms").doc(id).get()

    if (!roomDoc.exists) {
      return null
    }

    const room = { id: roomDoc.id, ...roomDoc.data() } as Room

    // Cache the result in Redis for 5 minutes
    await redis.set(`cache:room:${id}`, JSON.stringify(room), { ex: 300 })

    return room
  } catch (error) {
    console.error(`Error fetching room ${id}:`, error)
    throw new Error("Failed to fetch room")
  }
}
