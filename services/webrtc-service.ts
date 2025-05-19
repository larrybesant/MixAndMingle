import { supabase } from "@/lib/supabase-client"
import SimplePeer from "simple-peer"

// Type definitions
export type SignalData = {
  type?: string
  sdp?: string
  candidate?: RTCIceCandidate
}

export type PeerConnection = {
  peer: SimplePeer.Instance
  userId: string
  stream?: MediaStream
}

// ICE servers configuration for WebRTC
const iceServers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:global.stun.twilio.com:3478" }],
}

// Create a new peer connection as initiator (broadcaster)
export function createBroadcasterPeer(
  stream: MediaStream,
  userId: string,
  onSignal: (signal: SignalData) => void,
  onConnect: () => void,
  onClose: () => void,
  onError: (err: Error) => void,
): SimplePeer.Instance {
  const peer = new SimplePeer({
    initiator: true,
    trickle: true,
    stream,
    config: iceServers,
  })

  peer.on("signal", (data) => {
    onSignal(data)
  })

  peer.on("connect", () => {
    console.log("Broadcaster connected")
    onConnect()
  })

  peer.on("close", () => {
    console.log("Broadcaster connection closed")
    onClose()
  })

  peer.on("error", (err) => {
    console.error("Broadcaster peer error:", err)
    onError(err)
  })

  return peer
}

// Create a new peer connection as viewer
export function createViewerPeer(
  userId: string,
  onSignal: (signal: SignalData) => void,
  onStream: (stream: MediaStream) => void,
  onConnect: () => void,
  onClose: () => void,
  onError: (err: Error) => void,
): SimplePeer.Instance {
  const peer = new SimplePeer({
    initiator: false,
    trickle: true,
    config: iceServers,
  })

  peer.on("signal", (data) => {
    onSignal(data)
  })

  peer.on("stream", (stream) => {
    console.log("Received stream from broadcaster")
    onStream(stream)
  })

  peer.on("connect", () => {
    console.log("Viewer connected")
    onConnect()
  })

  peer.on("close", () => {
    console.log("Viewer connection closed")
    onClose()
  })

  peer.on("error", (err) => {
    console.error("Viewer peer error:", err)
    onError(err)
  })

  return peer
}

// Send a signal to a specific user
export async function sendSignal(streamId: string, fromUserId: string, toUserId: string, signal: SignalData) {
  const { error } = await supabase.from("webrtc_signals").insert({
    stream_id: streamId,
    sender_id: fromUserId,
    receiver_id: toUserId,
    signal,
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Error sending signal:", error)
    throw error
  }
}

// Subscribe to signals for a specific stream and user
export function subscribeToSignals(
  streamId: string,
  userId: string,
  onSignal: (fromUserId: string, signal: SignalData) => void,
) {
  const channel = supabase
    .channel(`webrtc-signals:${streamId}:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "webrtc_signals",
        filter: `receiver_id=eq.${userId}`,
      },
      (payload) => {
        const { sender_id, signal } = payload.new
        onSignal(sender_id, signal)
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Get user media (camera and microphone)
export async function getUserMedia(video = true, audio = true): Promise<MediaStream | null> {
  try {
    const constraints = {
      video: video
        ? {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          }
        : false,
      audio: audio
        ? {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        : false,
    }

    return await navigator.mediaDevices.getUserMedia(constraints)
  } catch (error) {
    console.error("Error getting user media:", error)
    return null
  }
}

// Get display media (screen sharing)
export async function getDisplayMedia(): Promise<MediaStream | null> {
  try {
    return await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: "always",
      },
      audio: true,
    })
  } catch (error) {
    console.error("Error getting display media:", error)
    return null
  }
}

// Stop all tracks in a media stream
export function stopMediaStream(stream: MediaStream | null) {
  if (!stream) return
  stream.getTracks().forEach((track) => {
    track.stop()
  })
}
