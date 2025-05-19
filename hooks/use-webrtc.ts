"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"

// Updated ICE server configuration with TURN servers
const iceServers = [
  {
    urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
  },
  {
    urls: [
      "turn:openrelay.metered.ca:80",
      "turn:openrelay.metered.ca:443",
      "turn:openrelay.metered.ca:443?transport=tcp",
    ],
    username: "openrelayproject",
    credential: "openrelayproject",
  },
]

// Quality presets for bandwidth adaptation
const qualityPresets = {
  high: {
    video: {
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
      frameRate: { ideal: 30, max: 30 },
    },
    bitrate: 2500000, // 2.5 Mbps
  },
  medium: {
    video: {
      width: { ideal: 854, max: 854 },
      height: { ideal: 480, max: 480 },
      frameRate: { ideal: 30, max: 30 },
    },
    bitrate: 1000000, // 1 Mbps
  },
  low: {
    video: {
      width: { ideal: 640, max: 640 },
      height: { ideal: 360, max: 360 },
      frameRate: { ideal: 24, max: 24 },
    },
    bitrate: 500000, // 500 Kbps
  },
  veryLow: {
    video: {
      width: { ideal: 426, max: 426 },
      height: { ideal: 240, max: 240 },
      frameRate: { ideal: 15, max: 15 },
    },
    bitrate: 250000, // 250 Kbps
  },
}

type PeerConnection = {
  id: string
  connection: RTCPeerConnection
  userId: string
  sender?: RTCRtpSender
}

type QualityLevel = "high" | "medium" | "low" | "veryLow" | "auto"

export function useWebRTC({
  streamId,
  localStream,
  onRemoteStream,
  isBroadcaster = false,
  initialQuality = "auto",
}: {
  streamId: string
  localStream: MediaStream | null
  onRemoteStream: (stream: MediaStream, peerId: string) => void
  isBroadcaster?: boolean
  initialQuality?: QualityLevel
}) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewerCount, setViewerCount] = useState(0)
  const [connectionType, setConnectionType] = useState<"direct" | "relay" | "unknown">("unknown")
  const [connectionQuality, setConnectionQuality] = useState<"good" | "medium" | "poor" | "unknown">("unknown")
  const [currentQuality, setCurrentQuality] = useState<QualityLevel>(initialQuality)
  const [availableBandwidth, setAvailableBandwidth] = useState<number | null>(null)
  const [isAdaptingBandwidth, setIsAdaptingBandwidth] = useState(initialQuality === "auto")

  const peerIdRef = useRef(uuidv4())
  const peersRef = useRef<Map<string, PeerConnection>>(new Map())
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pendingSignalsRef = useRef<Map<string, any[]>>(new Map())
  const bandwidthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const qualityChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastQualityChangeRef = useRef<number>(Date.now())
  const videoSenderRef = useRef<RTCRtpSender | null>(null)

  const supabase = createClient()

  // Connect to WebSocket signaling server
  const connectToSignalingServer = useCallback(() => {
    try {
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close()
      }

      // Create WebSocket connection
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const wsUrl = `${protocol}//${window.location.host}/api/ws?streamId=${streamId}&peerId=${peerIdRef.current}`

      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log("WebSocket connection established")
        setIsConnected(true)

        // Check for any pending signals in the database
        checkPendingSignals()
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)

          switch (message.type) {
            case "peers":
              // Connect to existing peers
              if (message.peers && message.peers.length > 0) {
                setViewerCount(message.peers.length)
                for (const peer of message.peers) {
                  createPeerConnection(peer.id, peer.userId, true)
                }
              }
              break

            case "signal":
              // Handle incoming signal
              handleIncomingSignal({
                from_peer_id: message.from,
                signal_data: message.data,
              })
              break

            case "peerLeft":
              // Handle peer leaving
              const peerConnection = peersRef.current.get(message.peerId)
              if (peerConnection) {
                peerConnection.connection.close()
                peersRef.current.delete(message.peerId)
                setViewerCount((count) => Math.max(0, count - 1))
              }
              break
          }
        } catch (error) {
          console.error("Error handling WebSocket message:", error)
        }
      }

      ws.onclose = (event) => {
        console.log(`WebSocket closed with code ${event.code}`)
        setIsConnected(false)

        // Attempt to reconnect unless this was a normal closure
        if (event.code !== 1000 && event.code !== 1001) {
          scheduleReconnect()
        }
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        setError("Connection error. Attempting to reconnect...")

        // WebSocket will close after error, which will trigger reconnect
      }
    } catch (err) {
      console.error("Error connecting to signaling server:", err)
      setError("Failed to connect to signaling server")
      scheduleReconnect()
    }
  }, [streamId])

  // Schedule reconnection attempt
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log("Attempting to reconnect to signaling server...")
      connectToSignalingServer()
    }, 5000) // Try to reconnect after 5 seconds
  }, [connectToSignalingServer])

  // Check for pending signals in the database
  const checkPendingSignals = useCallback(async () => {
    try {
      const { data: signals } = await supabase
        .from("webrtc_signals")
        .select("*")
        .eq("to_peer_id", peerIdRef.current)
        .order("created_at", { ascending: true })

      if (signals && signals.length > 0) {
        console.log(`Processing ${signals.length} pending signals`)

        // Process signals
        for (const signal of signals) {
          handleIncomingSignal(signal)
        }

        // Delete processed signals
        const signalIds = signals.map((s) => s.id)
        await supabase.from("webrtc_signals").delete().in("id", signalIds)
      }
    } catch (error) {
      console.error("Error checking pending signals:", error)
    }
  }, [supabase])

  // Create a new peer connection
  const createPeerConnection = useCallback(
    (peerId: string, userId: string, initiator: boolean) => {
      try {
        // Check if we already have a connection to this peer
        if (peersRef.current.has(peerId)) {
          return
        }

        console.log(`Creating peer connection to ${peerId} (initiator: ${initiator})`)
        const peerConnection = new RTCPeerConnection({ iceServers })

        // Add our local stream if we're the broadcaster
        let videoSender: RTCRtpSender | undefined
        if (isBroadcaster && localStream) {
          localStream.getTracks().forEach((track) => {
            const sender = peerConnection.addTrack(track, localStream)
            if (track.kind === "video") {
              videoSender = sender
              videoSenderRef.current = sender
            }
          })
        }

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            sendSignal(peerId, { type: "ice", ice: event.candidate })
          }
        }

        // Log ICE connection state changes
        peerConnection.oniceconnectionstatechange = () => {
          console.log(`ICE connection state: ${peerConnection.iceConnectionState}`)

          // Update connection stats when ICE state changes
          updateConnectionStats(peerConnection)

          if (peerConnection.iceConnectionState === "disconnected" || peerConnection.iceConnectionState === "failed") {
            console.log(`Peer ${peerId} disconnected or failed`)
            peersRef.current.delete(peerId)
            setViewerCount((count) => Math.max(0, count - 1))
          }
        }

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
          console.log(`Connection state: ${peerConnection.connectionState}`)

          if (peerConnection.connectionState === "disconnected" || peerConnection.connectionState === "failed") {
            peersRef.current.delete(peerId)
            setViewerCount((count) => Math.max(0, count - 1))
          }
        }

        // Handle incoming tracks (for viewers)
        peerConnection.ontrack = (event) => {
          console.log(`Received track from peer ${peerId}`)
          onRemoteStream(event.streams[0], peerId)
        }

        // Store the peer connection
        peersRef.current.set(peerId, {
          id: peerId,
          connection: peerConnection,
          userId,
          sender: videoSender,
        })

        // Process any pending signals for this peer
        const pendingSignals = pendingSignalsRef.current.get(peerId) || []
        if (pendingSignals.length > 0) {
          console.log(`Processing ${pendingSignals.length} pending signals for peer ${peerId}`)
          pendingSignals.forEach((signal) => {
            processSignal(peerConnection, signal)
          })
          pendingSignalsRef.current.delete(peerId)
        }

        // If we're the initiator, create and send an offer
        if (initiator) {
          peerConnection
            .createOffer()
            .then((offer) => peerConnection.setLocalDescription(offer))
            .then(() => {
              sendSignal(peerId, { type: "offer", sdp: peerConnection.localDescription })
            })
            .catch((err) => {
              console.error("Error creating offer:", err)
              setError("Failed to create connection offer")
            })
        }

        // Start monitoring connection stats
        if (!statsIntervalRef.current) {
          statsIntervalRef.current = setInterval(() => {
            for (const [_, peer] of peersRef.current.entries()) {
              updateConnectionStats(peer.connection)
            }
          }, 5000) // Check every 5 seconds
        }

        // Start bandwidth monitoring if we're the broadcaster
        if (isBroadcaster && !bandwidthCheckIntervalRef.current) {
          bandwidthCheckIntervalRef.current = setInterval(() => {
            monitorBandwidth()
          }, 2000) // Check every 2 seconds
        }

        return peerConnection
      } catch (err) {
        console.error("Error creating peer connection:", err)
        setError("Failed to create peer connection")
        return null
      }
    },
    [isBroadcaster, localStream, onRemoteStream],
  )

  // Process a WebRTC signal
  const processSignal = (peerConnection: RTCPeerConnection, signal: any) => {
    if (signal.type === "offer") {
      peerConnection
        .setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => peerConnection.createAnswer())
        .then((answer) => peerConnection.setLocalDescription(answer))
        .then(() => {
          sendSignal(signal.from_peer_id, { type: "answer", sdp: peerConnection.localDescription })
        })
        .catch((err) => {
          console.error("Error handling offer:", err)
        })
    } else if (signal.type === "answer") {
      peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).catch((err) => {
        console.error("Error handling answer:", err)
      })
    } else if (signal.type === "ice") {
      peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch((err) => {
        console.error("Error adding ICE candidate:", err)
      })
    }
  }

  // Monitor available bandwidth
  const monitorBandwidth = async () => {
    if (!isBroadcaster || peersRef.current.size === 0) return

    try {
      // Get the first peer connection for bandwidth monitoring
      const [_, peer] = Array.from(peersRef.current.entries())[0]
      const stats = await peer.connection.getStats()

      let outboundBitrate = 0
      let previousBytesSent = 0
      let previousTimestamp = 0

      stats.forEach((report) => {
        if (report.type === "outbound-rtp" && report.kind === "video") {
          const bytesSent = report.bytesSent
          const timestamp = report.timestamp

          if (previousBytesSent > 0 && previousTimestamp > 0) {
            const bytesChange = bytesSent - previousBytesSent
            const timeChange = timestamp - previousTimestamp
            outboundBitrate = (bytesChange * 8 * 1000) / timeChange // bits per second
          }

          previousBytesSent = bytesSent
          previousTimestamp = timestamp
        }
      })

      if (outboundBitrate > 0) {
        setAvailableBandwidth(outboundBitrate)

        // If auto-adaptation is enabled, adjust quality based on bandwidth
        if (isAdaptingBandwidth) {
          adaptQualityToAvailableBandwidth(outboundBitrate)
        }
      }
    } catch (error) {
      console.error("Error monitoring bandwidth:", error)
    }
  }

  // Adapt quality to available bandwidth
  const adaptQualityToAvailableBandwidth = (bandwidth: number) => {
    // Don't change quality too frequently (minimum 5 seconds between changes)
    const now = Date.now()
    if (now - lastQualityChangeRef.current < 5000) return

    let targetQuality: QualityLevel = "medium"

    // Determine target quality based on available bandwidth
    if (bandwidth >= 2000000) {
      // 2 Mbps or higher
      targetQuality = "high"
    } else if (bandwidth >= 800000) {
      // 800 Kbps to 2 Mbps
      targetQuality = "medium"
    } else if (bandwidth >= 400000) {
      // 400 Kbps to 800 Kbps
      targetQuality = "low"
    } else {
      // Less than 400 Kbps
      targetQuality = "veryLow"
    }

    // Only change if the target quality is different from current
    if (targetQuality !== currentQuality && currentQuality !== "auto") {
      console.log(`Adapting quality to ${targetQuality} based on bandwidth ${Math.round(bandwidth / 1000)} Kbps`)
      setQualityLevel(targetQuality)
    }
  }

  // Set quality level for video
  const setQualityLevel = useCallback(
    (quality: QualityLevel) => {
      if (!isBroadcaster || !localStream) return

      // If auto, just set the state and enable adaptation
      if (quality === "auto") {
        setCurrentQuality("auto")
        setIsAdaptingBandwidth(true)
        return
      }

      // Disable auto-adaptation if selecting a specific quality
      if (quality !== "auto") {
        setIsAdaptingBandwidth(false)
      }

      // Get the quality preset
      const preset = qualityPresets[quality === "auto" ? "medium" : quality]
      if (!preset) return

      // Update the video track constraints if possible
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        try {
          // Apply constraints to the video track
          videoTrack
            .applyConstraints(preset.video)
            .then(() => {
              console.log(`Applied ${quality} quality constraints to video track`)

              // Apply bitrate constraints to all peer connections
              for (const [_, peer] of peersRef.current.entries()) {
                if (peer.sender) {
                  const params = peer.sender.getParameters()
                  if (!params.encodings) {
                    params.encodings = [{}]
                  }

                  // Set max bitrate
                  params.encodings[0].maxBitrate = preset.bitrate

                  // Update the sender parameters
                  peer.sender
                    .setParameters(params)
                    .then(() => {
                      console.log(`Set max bitrate to ${preset.bitrate} bps for peer ${peer.id}`)
                    })
                    .catch((err) => {
                      console.error("Error setting sender parameters:", err)
                    })
                }
              }

              // Update state
              setCurrentQuality(quality)
              lastQualityChangeRef.current = Date.now()
            })
            .catch((err) => {
              console.error("Error applying video constraints:", err)
            })
        } catch (err) {
          console.error("Error setting quality level:", err)
        }
      }
    },
    [isBroadcaster, localStream],
  )

  // Update connection stats
  const updateConnectionStats = async (peerConnection: RTCPeerConnection) => {
    try {
      const stats = await peerConnection.getStats()
      let connType = "unknown"
      let connQuality = "unknown"
      let totalPacketsLost = 0
      let totalPackets = 0

      stats.forEach((report) => {
        // Check for ICE candidate pair to determine connection type
        if (report.type === "candidate-pair" && report.state === "succeeded") {
          connType = report.relayProtocol ? "relay" : "direct"
        }

        // Check for outbound-rtp to determine quality
        if (report.type === "outbound-rtp" || report.type === "inbound-rtp") {
          if (report.packetsLost !== undefined && report.packetsSent !== undefined) {
            totalPacketsLost += report.packetsLost
            totalPackets += report.packetsSent
          }
        }
      })

      // Calculate packet loss percentage
      if (totalPackets > 0) {
        const lossPercentage = (totalPacketsLost / totalPackets) * 100
        if (lossPercentage < 2) {
          connQuality = "good"
        } else if (lossPercentage < 5) {
          connQuality = "medium"
        } else {
          connQuality = "poor"
        }
      }

      setConnectionType(connType as "direct" | "relay" | "unknown")
      setConnectionQuality(connQuality as "good" | "medium" | "poor" | "unknown")
    } catch (err) {
      console.error("Error getting connection stats:", err)
    }
  }

  // Send a signal to another peer
  const sendSignal = useCallback(
    (targetPeerId: string, data: any) => {
      try {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "signal",
              target: targetPeerId,
              data,
            }),
          )
        } else {
          console.warn("WebSocket not open, falling back to HTTP signaling")
          // Fall back to HTTP signaling
          fetch("/api/signaling", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "signal",
              streamId,
              peerId: peerIdRef.current,
              target: targetPeerId,
              data,
            }),
          }).catch((err) => {
            console.error("Error sending signal via HTTP:", err)
          })
        }
      } catch (err) {
        console.error("Error sending signal:", err)
      }
    },
    [streamId],
  )

  // Handle incoming signals
  const handleIncomingSignal = useCallback(
    (signal: any) => {
      const { from_peer_id, signal_data } = signal

      // Get or create peer connection
      let peerConnection = peersRef.current.get(from_peer_id)?.connection

      if (!peerConnection) {
        // Store signal for later if we don't have a connection yet
        if (!pendingSignalsRef.current.has(from_peer_id)) {
          pendingSignalsRef.current.set(from_peer_id, [])
        }
        pendingSignalsRef.current.get(from_peer_id)?.push(signal_data)

        const newPeer = createPeerConnection(from_peer_id, "", false)
        if (!newPeer) return
        peerConnection = newPeer
        setViewerCount((count) => count + 1)
      } else {
        // Process the signal immediately
        processSignal(peerConnection, signal_data)
      }
    },
    [createPeerConnection],
  )

  // Leave the signaling server
  const leaveSignalingServer = useCallback(() => {
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "leave",
          }),
        )
        wsRef.current.close()
      }

      // Close all peer connections
      for (const [peerId, peer] of peersRef.current.entries()) {
        peer.connection.close()
        peersRef.current.delete(peerId)
      }

      setIsConnected(false)

      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current)
        statsIntervalRef.current = null
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }

      if (bandwidthCheckIntervalRef.current) {
        clearInterval(bandwidthCheckIntervalRef.current)
        bandwidthCheckIntervalRef.current = null
      }

      if (qualityChangeTimeoutRef.current) {
        clearTimeout(qualityChangeTimeoutRef.current)
        qualityChangeTimeoutRef.current = null
      }
    } catch (err) {
      console.error("Error leaving signaling server:", err)
    }
  }, [])

  // Initialize WebRTC
  useEffect(() => {
    if (streamId) {
      connectToSignalingServer()
    }

    return () => {
      leaveSignalingServer()
    }
  }, [streamId, connectToSignalingServer, leaveSignalingServer])

  // Apply initial quality setting
  useEffect(() => {
    if (isBroadcaster && localStream) {
      setQualityLevel(initialQuality)
    }
  }, [isBroadcaster, localStream, initialQuality, setQualityLevel])

  return {
    isConnected,
    error,
    viewerCount,
    peerId: peerIdRef.current,
    connectionType,
    connectionQuality,
    currentQuality,
    availableBandwidth,
    isAdaptingBandwidth,
    setQualityLevel,
  }
}
