import { supabase } from "@/utils/supabase-client"

// Get recordings for a stream
export async function getStreamRecordings(streamId: string) {
  try {
    const { data, error } = await supabase
      .from("stream_recordings")
      .select("*")
      .eq("stream_id", streamId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching stream recordings:", error)
      throw new Error("Failed to fetch recordings")
    }

    return data || []
  } catch (error) {
    console.error("Error in getStreamRecordings:", error)
    throw error
  }
}

// Get recording by ID
export async function getRecordingById(recordingId: string) {
  try {
    const { data, error } = await supabase.from("stream_recordings").select("*").eq("id", recordingId).single()

    if (error) {
      console.error("Error fetching recording:", error)
      throw new Error("Recording not found")
    }

    return data
  } catch (error) {
    console.error("Error in getRecordingById:", error)
    throw error
  }
}

// Create a new recording
export async function createRecording(streamId: string, recordingData: any) {
  try {
    const { data, error } = await supabase
      .from("stream_recordings")
      .insert([{ stream_id: streamId, ...recordingData }])
      .single()

    if (error) {
      console.error("Error creating recording:", error)
      throw new Error("Failed to create recording")
    }

    return data
  } catch (error) {
    console.error("Error in createRecording:", error)
    throw error
  }
}
