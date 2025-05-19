import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

// In-memory store for connected peers
// In production, you'd use Redis or another distributed store
const connectedPeers = new Map<string, { userId: string; lastSeen: number }>()

// Clean up stale connections (those inactive for more than 1 minute)
function cleanupStaleConnections() {
  const now = Date.now()
  for (const [peerId, data] of connectedPeers.entries()) {
    if (now - data.lastSeen > 60000) {
      connectedPeers.delete(peerId)
    }
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // Authenticate the user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action, streamId, peerId, target, data: signalData } = body

    // Clean up stale connections
    cleanupStaleConnections()

    // Handle different signaling actions
    switch (action) {
      case "join": {
        // Register this peer
        connectedPeers.set(peerId, { userId: user.id, lastSeen: Date.now() })

        // Get the stream details to check if this is the broadcaster
        const { data: stream } = await supabase.from("live_streams").select("dj_id").eq("id", streamId).single()

        const isBroadcaster = stream && stream.dj_id === user.id

        // Return the list of other peers in this stream (for mesh topology)
        const peers = Array.from(connectedPeers.entries())
          .filter(([id]) => id !== peerId) // Exclude self
          .map(([id, data]) => ({
            id,
            userId: data.userId,
          }))

        return NextResponse.json({
          success: true,
          peers,
          isBroadcaster,
        })
      }

      case "signal": {
        // Update last seen timestamp
        const peer = connectedPeers.get(peerId)
        if (peer) {
          peer.lastSeen = Date.now()
        }

        // Forward the signal to the target peer
        // In a production app, you'd use WebSockets or SSE for this
        // For this MVP, clients will need to poll for signals

        // Store the signal in a temporary database table
        await supabase.from("webrtc_signals").insert({
          from_peer_id: peerId,
          to_peer_id: target,
          stream_id: streamId,
          signal_data: signalData,
        })

        return NextResponse.json({ success: true })
      }

      case "leave": {
        // Remove this peer
        connectedPeers.delete(peerId)
        return NextResponse.json({ success: true })
      }

      case "getSignals": {
        // Get signals intended for this peer
        const { data: signals } = await supabase
          .from("webrtc_signals")
          .select("*")
          .eq("to_peer_id", peerId)
          .order("created_at", { ascending: true })

        // Delete the retrieved signals
        if (signals && signals.length > 0) {
          const signalIds = signals.map((s) => s.id)
          await supabase.from("webrtc_signals").delete().in("id", signalIds)
        }

        return NextResponse.json({
          success: true,
          signals: signals || [],
        })
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Signaling error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
