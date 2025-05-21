"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { db } from "@/lib/firebase-client-safe"
import { doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { useAuth } from "@/lib/auth-context"

// Define types
type PeerConnection = RTCPeerConnection
type DataChannel = RTCDataChannel
type MediaStream = MediaStream

interface WebRTCContextType {
  localStream: MediaStream | null
  remoteStreams: Map<string, MediaStream>
  startLocalStream: (videoEnabled: boolean, audioEnabled: boolean) => Promise<boolean>
  stopLocalStream: () => void
  joinRoom: (roomId: string) => Promise<void>
  leaveRoom: () => Promise<void>
  toggleVideo: () => void
  toggleAudio: () => void
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isConnecting: boolean
  isConnected: boolean
  currentRoomId: string | null
  error: string | null
}

const WebRTCContext = createContext<WebRTCContextType | null>(null)

// ICE server configuration (STUN/TURN servers)
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
}

export function WebRTCProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Refs to store connection state
  const peerConnections = useRef<Map<string, PeerConnection>>(new Map())
  const dataChannels = useRef<Map<string, DataChannel>>(new Map())

  // Start local media stream (camera/mic)
  const startLocalStream = async (videoEnabled: boolean, audioEnabled: boolean) => {
    try {
      setError(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled,
        audio: audioEnabled,
      })

      setLocalStream(stream)
      setIsVideoEnabled(videoEnabled)
      setIsAudioEnabled(audioEnabled)

      // Set initial track states
      stream.getVideoTracks().forEach((track) => {
        track.enabled = videoEnabled
      })

      stream.getAudioTracks().forEach((track) => {
        track.enabled = audioEnabled
      })

      return true
    } catch (err) {
      console.error("Error accessing media devices:", err)
      setError("Could not access camera or microphone. Please check permissions.")
      return false
    }
  }

  // Stop local media stream
  const stopLocalStream = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
      setLocalStream(null)
    }
  }

  // Toggle video on/off
  const toggleVideo = () => {
    if (localStream) {
      const newState = !isVideoEnabled
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = newState
      })
      setIsVideoEnabled(newState)
    }
  }

  // Toggle audio on/off
  const toggleAudio = () => {
    if (localStream) {
      const newState = !isAudioEnabled
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = newState
      })
      setIsAudioEnabled(newState)
    }
  }

  // Create a peer connection for a specific participant
  const createPeerConnection = (participantId: string) => {
    try {
      const peerConnection = new RTCPeerConnection(ICE_SERVERS)

      // Add local stream to peer connection
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream)
        })
      }

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && currentRoomId && user) {
          const candidateRef = collection(db, "rooms", currentRoomId, "candidates")
          addDoc(candidateRef, {
            sender: user.uid,
            receiver: participantId,
            candidate: event.candidate.toJSON(),
            timestamp: serverTimestamp(),
          })
        }
      }

      // Handle incoming tracks (remote stream)
      peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStreams((prev) => {
            const newMap = new Map(prev)
            newMap.set(participantId, event.streams[0])
            return newMap
          })
        }
      }

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        switch (peerConnection.connectionState) {
          case "connected":
            console.log(`Connected to ${participantId}`)
            setIsConnected(true)
            break
          case "disconnected":
          case "failed":
            console.log(`Connection to ${participantId} lost`)
            cleanupPeerConnection(participantId)
            break
          case "closed":
            console.log(`Connection to ${participantId} closed`)
            cleanupPeerConnection(participantId)
            break
        }
      }

      // Create and set up data channel
      const dataChannel = peerConnection.createDataChannel("chat")
      dataChannel.onmessage = (event) => {
        console.log("Received message:", event.data)
        // Handle incoming data channel messages
      }

      dataChannels.current.set(participantId, dataChannel)
      peerConnections.current.set(participantId, peerConnection)

      return peerConnection
    } catch (err) {
      console.error("Error creating peer connection:", err)
      setError("Failed to establish connection. Please try again.")
      return null
    }
  }

  // Clean up peer connection for a participant
  const cleanupPeerConnection = (participantId: string) => {
    // Close and remove peer connection
    const pc = peerConnections.current.get(participantId)
    if (pc) {
      pc.close()
      peerConnections.current.delete(participantId)
    }

    // Close and remove data channel
    const dc = dataChannels.current.get(participantId)
    if (dc) {
      dc.close()
      dataChannels.current.delete(participantId)
    }

    // Remove remote stream
    setRemoteStreams((prev) => {
      const newMap = new Map(prev)
      newMap.delete(participantId)
      return newMap
    })
  }

  // Join a video room
  const joinRoom = async (roomId: string) => {
    if (!user || !localStream) {
      setError("You must be logged in and have camera/microphone access to join a room")
      return
    }

    try {
      setIsConnecting(true)
      setError(null)
      setCurrentRoomId(roomId)

      // Add current user to room participants
      const participantRef = doc(db, "rooms", roomId, "participants", user.uid)
      await updateDoc(doc(db, "rooms", roomId), {
        participants: increment(1),
      })

      await updateDoc(participantRef, {
        userId: user.uid,
        displayName: user.displayName,
        joinedAt: serverTimestamp(),
        isActive: true,
      })

      // Listen for offers, answers, and ICE candidates
      setupSignalingListeners(roomId)

      // When the user joins, send offers to all existing participants
      const participantsRef = collection(db, "rooms", roomId, "participants")
      onSnapshot(participantsRef, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          const participantId = change.doc.id

          // Skip self
          if (participantId === user.uid) return

          // When a new participant joins
          if (change.type === "added" && change.doc.data().isActive) {
            // Create peer connection
            const pc = createPeerConnection(participantId)
            if (!pc) return

            // Create and send offer
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)

            const offerRef = collection(db, "rooms", roomId, "offers")
            await addDoc(offerRef, {
              sender: user.uid,
              receiver: participantId,
              sdp: offer.sdp,
              type: offer.type,
              timestamp: serverTimestamp(),
            })
          }

          // When a participant leaves
          if (change.type === "modified" && !change.doc.data().isActive) {
            cleanupPeerConnection(participantId)
          }
        })
      })

      setIsConnecting(false)
    } catch (err) {
      console.error("Error joining room:", err)
      setError("Failed to join room. Please try again.")
      setIsConnecting(false)
    }
  }

  // Set up listeners for WebRTC signaling
  const setupSignalingListeners = (roomId: string) => {
    if (!user) return

    // Listen for offers
    const offersRef = collection(db, "rooms", roomId, "offers")
    onSnapshot(offersRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const data = change.doc.data()

          // Only process offers meant for this user
          if (data.receiver === user.uid) {
            // Create peer connection if it doesn't exist
            let pc = peerConnections.current.get(data.sender)
            if (!pc) {
              pc = createPeerConnection(data.sender)
              if (!pc) return
            }

            // Set remote description (the offer)
            await pc.setRemoteDescription({
              type: data.type,
              sdp: data.sdp,
            })

            // Create and send answer
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)

            const answerRef = collection(db, "rooms", roomId, "answers")
            await addDoc(answerRef, {
              sender: user.uid,
              receiver: data.sender,
              sdp: answer.sdp,
              type: answer.type,
              timestamp: serverTimestamp(),
            })

            // Delete processed offer
            await deleteDoc(doc(db, "rooms", roomId, "offers", change.doc.id))
          }
        }
      })
    })

    // Listen for answers
    const answersRef = collection(db, "rooms", roomId, "answers")
    onSnapshot(answersRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const data = change.doc.data()

          // Only process answers meant for this user
          if (data.receiver === user.uid) {
            const pc = peerConnections.current.get(data.sender)
            if (pc) {
              await pc.setRemoteDescription({
                type: data.type,
                sdp: data.sdp,
              })
            }

            // Delete processed answer
            await deleteDoc(doc(db, "rooms", roomId, "answers", change.doc.id))
          }
        }
      })
    })

    // Listen for ICE candidates
    const candidatesRef = collection(db, "rooms", roomId, "candidates")
    onSnapshot(candidatesRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const data = change.doc.data()

          // Only process candidates meant for this user
          if (data.receiver === user.uid) {
            const pc = peerConnections.current.get(data.sender)
            if (pc) {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
            }

            // Delete processed candidate
            await deleteDoc(doc(db, "rooms", roomId, "candidates", change.doc.id))
          }
        }
      })
    })
  }

  // Leave a video room
  const leaveRoom = async () => {
    if (!currentRoomId || !user) return

    try {
      // Update participant status
      const participantRef = doc(db, "rooms", currentRoomId, "participants", user.uid)
      await updateDoc(participantRef, {
        isActive: false,
        leftAt: serverTimestamp(),
      })

      // Update room participant count
      await updateDoc(doc(db, "rooms", currentRoomId), {
        participants: increment(-1),
      })

      // Close all peer connections
      peerConnections.current.forEach((pc) => pc.close())
      peerConnections.current.clear()
      dataChannels.current.forEach((dc) => dc.close())
      dataChannels.current.clear()

      setRemoteStreams(new Map())
      setCurrentRoomId(null)
      setIsConnected(false)
    } catch (err) {
      console.error("Error leaving room:", err)
      setError("Failed to leave room properly.")
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopLocalStream()
      peerConnections.current.forEach((pc) => pc.close())
      peerConnections.current.clear()
      dataChannels.current.forEach((dc) => dc.close())
      dataChannels.current.clear()
    }
  }, [])

  const value = {
    localStream,
    remoteStreams,
    startLocalStream,
    stopLocalStream,
    joinRoom,
    leaveRoom,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled,
    isConnecting,
    isConnected,
    currentRoomId,
    error,
  }

  return <WebRTCContext.Provider value={value}>{children}</WebRTCContext.Provider>
}

// Helper to increment Firestore values
function increment(amount: number) {
  return {
    increment: amount,
  }
}

// Custom hook to use WebRTC context
export const useWebRTC = () => {
  const context = useContext(WebRTCContext)
  if (!context) {
    throw new Error("useWebRTC must be used within a WebRTCProvider")
  }
  return context
}
