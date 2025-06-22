"use client"

// DailyVideoRoom.tsx
// A simple Daily.co video room embed for host/viewer

import React from "react"
import DailyIframe from "@daily-co/daily-js"

interface DailyVideoRoomProps {
  roomUrl: string
  isHost?: boolean
}

export const DailyVideoRoom: React.FC<DailyVideoRoomProps> = ({ roomUrl, isHost }) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const callFrameRef = React.useRef<any>(null)

  React.useEffect(() => {
    if (!roomUrl || !containerRef.current) return
    // Clean up any previous frame
    if (callFrameRef.current) {
      callFrameRef.current.destroy()
      callFrameRef.current = null
    }
    // Create the Daily iframe inside the container
    callFrameRef.current = DailyIframe.createFrame(containerRef.current, {
      showLeaveButton: true,
      iframeStyle: {
        width: "100%",
        height: "400px",
        border: "0",
        borderRadius: "16px",
      },
    })
    callFrameRef.current.join({ url: roomUrl })
    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.leave()
        callFrameRef.current.destroy()
        callFrameRef.current = null
      }
    }
  }, [roomUrl])

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: 400,
        borderRadius: 16,
        overflow: "hidden",
      }}
    />
  )
}
