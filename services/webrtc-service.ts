import { supabase } from "@/utils/supabase-client"

// Signal types
export type SignalData = RTCSessionDescriptionInit | RTCIceCandidateInit

// Send a WebRTC signal
export async function sendSignal(streamId: string, fromUserId: string, toUserId: string, signal: SignalData) {
  if (!streamId || !fromUserId || !toUserId || !signal) {
    throw new Error("Missing required parameters for sendSignal")
  }

  try {
    const { error } = await supabase.from("webrtc_signals").insert({
      stream_id: streamId,
      sender_id: fromUserId,
      receiver_id: toUserId,
      signal_data: signal,
    })

    if (error) {
      console.error("Error sending signal:", error)
      throw new Error(`Failed to send signal: ${error.message}`)
    }
  } catch (error) {
    console.error("Error in sendSignal:", error)
    throw error
  }
}

// Subscribe to WebRTC signals
export function subscribeToSignals(
  streamId: string,
  userId: string,
  onSignal: (fromUserId: string, signal: SignalData) => void,
) {
  if (!streamId || !userId || !onSignal) {
    console.error("Missing required parameters for subscribeToSignals")
    return () => {}
  }

  try {
    // Subscribe to new signals
    const subscription = supabase
      .channel(`webrtc:${streamId}:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "webrtc_signals",
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          const { sender_id, signal_data } = payload.new
          onSignal(sender_id, signal_data)
        },
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          console.error("Failed to subscribe to signals:", status)
        }
      })

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(subscription)
    }
  } catch (error) {
    console.error("Error in subscribeToSignals:", error)
    throw error
  }
}

// Get user media (camera and microphone)
export async function getUserMedia(video: boolean, audio: boolean): Promise<MediaStream | null> {
  try {
    return await navigator.mediaDevices.getUserMedia({ video, audio })
  } catch (error) {
    console.error("Error getting user media:", error)
    return null
  }
}

// Get display media (screen sharing)
export async function getDisplayMedia(): Promise<MediaStream | null> {
  try {
    return await navigator.mediaDevices.getDisplayMedia({ video: true })
  } catch (error) {
    console.error("Error getting display media:", error)
    return null
  }
}

// Stop media stream
export function stopMediaStream(stream: MediaStream | null): void {
  if (!stream) return
  stream.getTracks().forEach((track) => track.stop())
}

// Create a peer connection for the broadcaster
export function createBroadcasterPeer(
  stream: MediaStream,
  userId: string,
  onSignal: (signal: SignalData) => void,
  onConnect: () => void,
  onDisconnect: () => void,
  onError: (error: Error) => void,
) {
  if (!stream || !userId || !onSignal || !onConnect || !onDisconnect || !onError) {
    throw new Error("Missing required parameters for createBroadcasterPeer")
  }

  try {
    // Create peer connection
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
    })

    // Add tracks to peer connection
    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream)
    })

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        onSignal({ candidate: event.candidate })
      }
    }

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      switch (peerConnection.connectionState) {
        case "connected":
          onConnect()
          break
        case "disconnected":
        case "failed":
        case "closed":
          onDisconnect()
          break
      }
    }

    // Handle negotiation needed
    peerConnection.onnegotiationneeded = async () => {
      try {
        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)
        onSignal(peerConnection.localDescription!)
      } catch (error) {
        console.error("Error creating offer:", error)
        onError(error as Error)
      }
    }

    // Create signal method
    const signal = async (data: SignalData) => {
      try {
        if (data.sdp) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data))
          if (data.sdp.type === "offer") {
            const answer = await peerConnection.createAnswer()
            await peerConnection.setLocalDescription(answer)
            onSignal(peerConnection.localDescription!)
          }
        } else if (data.candidate) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
        }
      } catch (error) {
        console.error("Error handling signal:", error)
        onError(error as Error)
      }
    }

    return {
      signal,
      destroy: () => {
        peerConnection.close()
      },
      addStream: (newStream: MediaStream) => {
        // Remove existing tracks
        peerConnection.getSenders().forEach((sender) => {
          peerConnection.removeTrack(sender)
        })
        // Add new tracks
        newStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, newStream)
        })
      },
      removeStream: (oldStream: MediaStream) => {
        oldStream.getTracks().forEach((track) => {
          const sender = peerConnection.getSenders().find((s) => s.track === track)
          if (sender) {
            peerConnection.removeTrack(sender)
          }
        })
      },
    }
  } catch (error) {
    console.error("Error creating broadcaster peer:", error)
    onError(error as Error)
    throw error
  }
}

// Create a peer connection for the viewer
export function createViewerPeer(
  userId: string,
  onSignal: (signal: SignalData) => void,
  onStream: (stream: MediaStream) => void,
  onConnect: () => void,
  onDisconnect: () => void,
  onError: (error: Error) => void,
) {
  if (!userId || !onSignal || !onStream || !onConnect || !onDisconnect || !onError) {
    throw new Error("Missing required parameters for createViewerPeer")
  }

  try {
    // Create peer connection
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
    })

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        onSignal({ candidate: event.candidate })
      }
    }

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      onStream(event.streams[0])
    }

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      switch (peerConnection.connectionState) {
        case "connected":
          onConnect()
          break
        case "disconnected":
        case "failed":
        case "closed":
          onDisconnect()
          break
      }
    }

    // Create offer
    const createOffer = async () => {
      try {
        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)
        onSignal(peerConnection.localDescription!)
      } catch (error) {
        console.error("Error creating offer:", error)
        onError(error as Error)
      }
    }

    // Create signal method
    const signal = async (data: SignalData) => {
      try {
        if (data.sdp) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data))
          if (data.sdp.type === "offer") {
            const answer = await peerConnection.createAnswer()
            await peerConnection.setLocalDescription(answer)
            onSignal(peerConnection.localDescription!)
          }
        } else if (data.candidate) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
        }
      } catch (error) {
        console.error("Error handling signal:", error)
        onError(error as Error)
      }
    }

    // Start connection
    createOffer()

    return {
      signal,
      destroy: () => {
        peerConnection.close()
      },
    }
  } catch (error) {
    console.error("Error creating viewer peer:", error)
    onError(error as Error)
    throw error
  }
}
