import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // Authenticate the user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Get the WebSocket upgrade information
  const upgradeHeader = request.headers.get("Upgrade")
  if (upgradeHeader !== "websocket") {
    return new Response("Expected Upgrade: websocket", { status: 400 })
  }

  try {
    // Get the WebSocket server instance
    const { socket, response } = await WebSocketHandler.getOrCreateInstance()

    // Extract query parameters
    const { searchParams } = new URL(request.url)
    const streamId = searchParams.get("streamId")
    const peerId = searchParams.get("peerId")

    if (!streamId || !peerId) {
      return new Response("Missing streamId or peerId", { status: 400 })
    }

    // Store user info for later use
    const clientData = {
      userId: user.id,
      streamId,
      peerId,
    }

    // Handle the WebSocket connection
    socket.handleUpgrade(request, clientData, response)

    return response
  } catch (error) {
    console.error("WebSocket error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

// WebSocket handler singleton
class WebSocketHandler {
  private static instance: WebSocketHandler
  private clients = new Map<string, any>()
  private streams = new Map<string, Set<string>>()

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static async getOrCreateInstance(): Promise<{ socket: WebSocketHandler; response: Response }> {
    if (!WebSocketHandler.instance) {
      WebSocketHandler.instance = new WebSocketHandler()
    }

    // Create a new WebSocket connection
    const { readable, writable } = new TransformStream()
    const response = new Response(readable, {
      headers: {
        "Content-Type": "text/plain",
        Connection: "Upgrade",
        Upgrade: "websocket",
      },
      status: 101, // Switching Protocols
    })

    return { socket: WebSocketHandler.instance, response }
  }

  public async handleUpgrade(request: NextRequest, clientData: any, response: Response) {
    const { peerId, streamId, userId } = clientData

    // Create a WebSocket connection
    const webSocket = new WebSocket(request.url)

    // Store client information
    this.clients.set(peerId, {
      ws: webSocket,
      userId,
      streamId,
      lastSeen: Date.now(),
    })

    // Add client to stream
    if (!this.streams.has(streamId)) {
      this.streams.set(streamId, new Set())
    }
    this.streams.get(streamId)?.add(peerId)

    // Handle WebSocket events
    webSocket.onopen = () => {
      console.log(`WebSocket connection established for peer ${peerId}`)

      // Send the list of peers in this stream
      const peers = Array.from(this.streams.get(streamId) || [])
        .filter((id) => id !== peerId)
        .map((id) => {
          const client = this.clients.get(id)
          return {
            id,
            userId: client?.userId,
          }
        })

      webSocket.send(
        JSON.stringify({
          type: "peers",
          peers,
        }),
      )
    }

    webSocket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data)

        // Update last seen timestamp
        const client = this.clients.get(peerId)
        if (client) {
          client.lastSeen = Date.now()
        }

        // Handle different message types
        switch (message.type) {
          case "signal":
            // Forward signal to target peer
            const targetPeer = this.clients.get(message.target)
            if (targetPeer && targetPeer.ws.readyState === WebSocket.OPEN) {
              targetPeer.ws.send(
                JSON.stringify({
                  type: "signal",
                  from: peerId,
                  data: message.data,
                }),
              )
            } else {
              // Store signal in database if target peer is not connected
              const cookieStore = cookies()
              const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

              await supabase.from("webrtc_signals").insert({
                from_peer_id: peerId,
                to_peer_id: message.target,
                stream_id: streamId,
                signal_data: message.data,
              })
            }
            break

          case "leave":
            this.handlePeerLeave(peerId)
            break
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error)
      }
    }

    webSocket.onclose = () => {
      this.handlePeerLeave(peerId)
    }

    webSocket.onerror = (error) => {
      console.error(`WebSocket error for peer ${peerId}:`, error)
      this.handlePeerLeave(peerId)
    }

    // Start cleanup interval if not already running
    if (!this.cleanupInterval) {
      this.cleanupInterval = setInterval(() => this.cleanupStaleConnections(), 60000) // Every minute
    }
  }

  private cleanupInterval: NodeJS.Timeout | null = null

  private handlePeerLeave(peerId: string) {
    const client = this.clients.get(peerId)
    if (client) {
      const { streamId } = client

      // Remove from stream
      this.streams.get(streamId)?.delete(peerId)
      if (this.streams.get(streamId)?.size === 0) {
        this.streams.delete(streamId)
      }

      // Close WebSocket if still open
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.close()
      }

      // Remove client
      this.clients.delete(peerId)

      // Notify other peers in the stream
      this.notifyPeerLeft(streamId, peerId)
    }
  }

  private notifyPeerLeft(streamId: string, peerId: string) {
    const peers = this.streams.get(streamId) || new Set()

    for (const id of peers) {
      const client = this.clients.get(id)
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(
          JSON.stringify({
            type: "peerLeft",
            peerId,
          }),
        )
      }
    }
  }

  private cleanupStaleConnections() {
    const now = Date.now()
    const staleTimeout = 5 * 60 * 1000 // 5 minutes

    for (const [peerId, client] of this.clients.entries()) {
      if (now - client.lastSeen > staleTimeout) {
        console.log(`Cleaning up stale connection for peer ${peerId}`)
        this.handlePeerLeave(peerId)
      }
    }
  }
}
