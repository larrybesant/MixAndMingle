import { supabase } from "@/lib/supabase-client"
import type { UserLocation } from "@/types/database"

// Get user location
export async function getUserLocation(userId: string): Promise<UserLocation | null> {
  if (!userId) return null

  const { data, error } = await supabase.from("user_locations").select("*").eq("user_id", userId).single()

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("Error fetching user location:", error)
    }
    return null
  }

  return data
}

// Update user location
export async function updateUserLocation(
  userId: string,
  latitude: number,
  longitude: number,
  city?: string,
  state?: string,
  country?: string,
): Promise<UserLocation | null> {
  if (!userId || latitude === undefined || longitude === undefined) return null

  // Check if location exists
  const { data: existingLocation } = await supabase.from("user_locations").select("id").eq("user_id", userId).single()

  if (existingLocation) {
    // Update existing location
    const { data, error } = await supabase
      .from("user_locations")
      .update({
        latitude,
        longitude,
        city,
        state,
        country,
        last_updated: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating user location:", error)
      return null
    }

    return data
  } else {
    // Create new location
    const { data, error } = await supabase
      .from("user_locations")
      .insert({
        user_id: userId,
        latitude,
        longitude,
        city,
        state,
        country,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating user location:", error)
      return null
    }

    return data
  }
}

// Get nearby users
export async function getNearbyUsers(
  userId: string,
  latitude: number,
  longitude: number,
  radiusKm = 50,
): Promise<string[]> {
  if (!userId || latitude === undefined || longitude === undefined) return []

  // This is a simplified approach. In a real app, you would use PostGIS or a similar extension
  // to perform proper geospatial queries. This implementation just gets users within a rough bounding box.

  // Convert radius from km to degrees (approximate)
  const radiusDegrees = radiusKm / 111 // 1 degree is approximately 111 km

  const { data, error } = await supabase
    .from("user_locations")
    .select("user_id")
    .neq("user_id", userId)
    .gte("latitude", latitude - radiusDegrees)
    .lte("latitude", latitude + radiusDegrees)
    .gte("longitude", longitude - radiusDegrees)
    .lte("longitude", longitude + radiusDegrees)

  if (error) {
    console.error("Error fetching nearby users:", error)
    return []
  }

  return data?.map((item) => item.user_id) || []
}

// Get user distance
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Haversine formula to calculate distance between two points on Earth
  const R = 6371 // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in km

  return distance
}

// Get users within distance
export async function getUsersWithinDistance(
  latitude: number,
  longitude: number,
  radiusKm = 50,
  limit = 50,
): Promise<any[]> {
  if (latitude === undefined || longitude === undefined) return []

  try {
    // Get all user locations
    const { data, error } = await supabase.from("user_locations").select(`
        *,
        profiles:user_id(id, first_name, last_name, avatar_url, username)
      `)

    if (error) {
      console.error("Error fetching user locations:", error)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    // Calculate distance for each user
    const usersWithDistance = data.map((location) => {
      const distance = calculateDistance(latitude, longitude, location.latitude, location.longitude)

      return {
        ...location,
        distance,
      }
    })

    // Filter users within the radius and sort by distance
    return usersWithDistance
      .filter((user) => user.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
  } catch (error) {
    console.error("Error in getUsersWithinDistance:", error)
    return []
  }
}
