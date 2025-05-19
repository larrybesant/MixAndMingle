// WebRTC configuration
const configuration: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
}

interface PeerConnectionCallbacks {
  onTrack?: (event: RTCTrackEvent) => void
  onIceCandidate?: (candidate: RTCIceCandidate | null) => void
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void
  onError?: (error: Error) => void
}

// Create a new RTCPeerConnection
export function createPeerConnection(callbacks: PeerConnectionCallbacks = {}): RTCPeerConnection {
  try {
    const peerConnection = new RTCPeerConnection(configuration)

    // Set up event handlers
    if (callbacks.onTrack) {
      peerConnection.ontrack = callbacks.onTrack
    }

    if (callbacks.onIceCandidate) {
      peerConnection.onicecandidate = (event) => {
        callbacks.onIceCandidate?.(event.candidate)
      }
    }

    if (callbacks.onConnectionStateChange) {
      peerConnection.onconnectionstatechange = () => {
        callbacks.onConnectionStateChange?.(peerConnection.connectionState)
      }
    }

    return peerConnection
  } catch (error) {
    console.error("Error creating peer connection:", error)
    callbacks.onError?.(error as Error)
    throw error
  }
}

// Add tracks from a media stream to a peer connection
export function addTracks(peerConnection: RTCPeerConnection, stream: MediaStream): void {
  stream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, stream)
  })
}

// Create an offer
export async function createOffer(peerConnection: RTCPeerConnection): Promise<RTCSessionDescriptionInit> {
  try {
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    return offer
  } catch (error) {
    console.error("Error creating offer:", error)
    throw error
  }
}

// Create an answer
export async function createAnswer(peerConnection: RTCPeerConnection): Promise<RTCSessionDescriptionInit> {
  try {
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    return answer
  } catch (error) {
    console.error("Error creating answer:", error)
    throw error
  }
}

// Set remote description
export async function setRemoteDescription(
  peerConnection: RTCPeerConnection,
  description: RTCSessionDescriptionInit,
): Promise<void> {
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(description))
  } catch (error) {
    console.error("Error setting remote description:", error)
    throw error
  }
}

// Add ICE candidate
export async function addIceCandidate(
  peerConnection: RTCPeerConnection,
  candidate: RTCIceCandidateInit,
): Promise<void> {
  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
  } catch (error) {
    console.error("Error adding ICE candidate:", error)
    throw error
  }
}
