import { supabase } from "@/lib/supabase-client"
import type { UserLocation } from "@/types/database"

export async function getUserLocation(userId: string): Promise<UserLocation | null> {
  const { data, error } = await supabase.from("user_locations").select("*").eq("user_id", userId).single()

  if (error) {
    console.error("Error fetching user location:", error)
    return null
  }

  return data
}

export async function updateUserLocation(
  userId: string,
  latitude: number,
  longitude: number,
  city?: string,
  state?: string,
  country?: string,
): Promise<UserLocation | null> {
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

export async function getNearbyUsers(
  userId: string,
  latitude: number,
  longitude: number,
  radiusKm = 50,
): Promise<string[]> {
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
