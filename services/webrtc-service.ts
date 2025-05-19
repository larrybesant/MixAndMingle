"use client"

import { supabase } from "@/lib/supabase-client"
import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore"
import { useEffect, useRef, useState } from "react"
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

export type PeerSignal = {
  id: string
  senderId: string
  receiverId: string
  signal: SignalData
  timestamp: Date
  streamId: string
}

// ICE servers configuration for WebRTC
const iceServers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:global.stun.twilio.com:3478" }],
}

// WebRTC configuration with public STUN servers
const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
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
    from_user_id: fromUserId,
    to_user_id: toUserId,
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
        filter: `to_user_id=eq.${userId}`,
      },
      (payload) => {
        const { from_user_id, signal } = payload.new
        onSignal(from_user_id, signal)
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Hook for broadcasting a stream
export function useBroadcaster(streamId: string, userId: string) {
  const [peers, setPeers] = useState<{ [key: string]: SimplePeer.Instance }>({})
  const [viewers, setViewers] = useState<string[]>([])
  const [isLive, setIsLive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const unsubscribeRef = useRef<() => void>(() => {})

  // Start broadcasting
  const startBroadcast = async () => {
    try {
      // Get user media (camera and microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      streamRef.current = stream
      setIsLive(true)

      // Listen for viewer signals
      const signalsRef = collection(db, "webrtc_signals")
      const q = query(
        signalsRef,
        where("receiverId", "==", userId),
        where("streamId", "==", streamId),
        orderBy("timestamp", "desc"),
        limit(100),
      )

      unsubscribeRef.current = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data() as PeerSignal
            const { senderId, signal } = data

            // Create a new peer connection if it doesn't exist
            if (!peers[senderId]) {
              const peer = new SimplePeer({
                initiator: false,
                config: rtcConfig,
                stream: streamRef.current!,
              })

              // Handle signals from the viewer
              peer.on("signal", async (signal) => {
                await addDoc(collection(db, "webrtc_signals"), {
                  senderId: userId,
                  receiverId: senderId,
                  signal,
                  streamId,
                  timestamp: serverTimestamp(),
                })
              })

              // Handle peer connection close
              peer.on("close", () => {
                setPeers((prevPeers) => {
                  const newPeers = { ...prevPeers }
                  delete newPeers[senderId]
                  return newPeers
                })

                setViewers((prevViewers) => prevViewers.filter((id) => id !== senderId))
              })

              // Handle errors
              peer.on("error", (err) => {
                console.error("Peer error:", err)
                setError(`Connection error: ${err.message}`)
              })

              // Add the new peer to state
              setPeers((prevPeers) => ({
                ...prevPeers,
                [senderId]: peer,
              }))

              // Add the viewer to the list
              setViewers((prevViewers) => (prevViewers.includes(senderId) ? prevViewers : [...prevViewers, senderId]))

              // Signal the peer
              peer.signal(signal)
            } else {
              // If peer exists, just signal it
              peers[senderId].signal(signal)
            }

            // Delete the signal document after processing
            deleteDoc(doc(db, "webrtc_signals", change.doc.id))
          }
        })
      })

      // Update the stream status in the database
      const streamDocRef = doc(db, "live_streams", streamId)
      await updateDoc(streamDocRef, {
        status: "live",
        actual_start: serverTimestamp(),
      })
    } catch (err: any) {
      console.error("Failed to start broadcast:", err)
      setError(`Failed to access camera/microphone: ${err.message}`)
    }
  }

  // Stop broadcasting
  const stopBroadcast = async () => {
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    // Close all peer connections
    Object.values(peers).forEach((peer) => peer.destroy())
    setPeers({})
    setViewers([])
    setIsLive(false)

    // Unsubscribe from Firestore
    unsubscribeRef.current()

    // Update the stream status in the database
    try {
      const streamDocRef = doc(db, "live_streams", streamId)
      await updateDoc(streamDocRef, {
        status: "ended",
        ended_at: serverTimestamp(),
      })
    } catch (err) {
      console.error("Error updating stream status:", err)
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isLive) {
        stopBroadcast()
      }
    }
  }, [])

  return {
    startBroadcast,
    stopBroadcast,
    isLive,
    viewerCount: viewers.length,
    error,
    stream: streamRef.current,
  }
}

// Hook for viewing a stream
export function useViewer(streamId: string, broadcasterId: string, userId: string) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const peerRef = useRef<SimplePeer.Instance | null>(null)
  const unsubscribeRef = useRef<() => void>(() => {})

  // Connect to the broadcaster
  const connectToStream = async () => {
    try {
      // Create a new peer connection
      const peer = new SimplePeer({
        initiator: true,
        config: rtcConfig,
      })

      peerRef.current = peer

      // Handle signals from the peer
      peer.on("signal", async (signal) => {
        await addDoc(collection(db, "webrtc_signals"), {
          senderId: userId,
          receiverId: broadcasterId,
          signal,
          streamId,
          timestamp: serverTimestamp(),
        })
      })

      // Handle incoming stream
      peer.on("stream", (remoteStream) => {
        setStream(remoteStream)
        setIsConnected(true)
      })

      // Handle peer connection close
      peer.on("close", () => {
        setIsConnected(false)
        setStream(null)
      })

      // Handle errors
      peer.on("error", (err) => {
        console.error("Peer error:", err)
        setError(`Connection error: ${err.message}`)
        setIsConnected(false)
      })

      // Listen for broadcaster signals
      const signalsRef = collection(db, "webrtc_signals")
      const q = query(
        signalsRef,
        where("receiverId", "==", userId),
        where("senderId", "==", broadcasterId),
        where("streamId", "==", streamId),
        orderBy("timestamp", "desc"),
        limit(100),
      )

      unsubscribeRef.current = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data() as PeerSignal

            // Signal the peer
            if (peerRef.current) {
              peerRef.current.signal(data.signal)
            }

            // Delete the signal document after processing
            deleteDoc(doc(db, "webrtc_signals", change.doc.id))
          }
        })
      })
    } catch (err: any) {
      console.error("Failed to connect to stream:", err)
      setError(`Connection error: ${err.message}`)
    }
  }

  // Disconnect from the stream
  const disconnectFromStream = () => {
    if (peerRef.current) {
      peerRef.current.destroy()
      peerRef.current = null
    }

    setStream(null)
    setIsConnected(false)
    unsubscribeRef.current()
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnectFromStream()
      }
    }
  }, [])

  return {
    connectToStream,
    disconnectFromStream,
    stream,
    isConnected,
    error,
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
        displaySurface: "monitor",
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
