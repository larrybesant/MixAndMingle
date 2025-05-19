import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

// Start recording a stream
export async function startRecording(stream: MediaStream): Promise<MediaRecorder> {
  const options = { mimeType: "video/webm;codecs=vp9,opus" }
  let mediaRecorder: MediaRecorder

  try {
    mediaRecorder = new MediaRecorder(stream, options)
  } catch (e) {
    console.error("MediaRecorder error:", e)
    try {
      // Fallback to a more widely supported format
      mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" })
    } catch (e) {
      console.error("MediaRecorder fallback error:", e)
      throw new Error("Recording not supported in this browser")
    }
  }

  return mediaRecorder
}

// Upload a recorded blob to Firebase Storage
export async function uploadRecording(
  blob: Blob,
  streamId: string,
  userId: string,
): Promise<{ url: string; path: string }> {
  try {
    const timestamp = new Date().getTime()
    const path = `recordings/${userId}/${streamId}/${timestamp}.webm`
    const storageRef = ref(storage, path)

    await uploadBytes(storageRef, blob)
    const url = await getDownloadURL(storageRef)

    return { url, path }
  } catch (error) {
    console.error("Error uploading recording:", error)
    throw error
  }
}

// Save recording metadata to Supabase
export async function saveRecordingMetadata(
  streamId: string,
  djId: string,
  recordingUrl: string,
  storagePath: string,
  duration: number,
) {
  const { supabase } = await import("@/lib/supabase-client")

  const { data, error } = await supabase
    .from("stream_recordings")
    .insert({
      stream_id: streamId,
      dj_id: djId,
      recording_url: recordingUrl,
      storage_path: storagePath,
      duration_seconds: duration,
      created_at: new Date().toISOString(),
    })
    .select()

  if (error) {
    console.error("Error saving recording metadata:", error)
    throw error
  }

  return data
}
