"use client"

import { useState, useEffect } from "react"

export function useWebRTCSupport() {
  const [isSupported, setIsSupported] = useState(true)
  const [details, setDetails] = useState<{
    rtcPeerConnection: boolean
    getUserMedia: boolean
    mediaDevices: boolean
    mediaRecorder: boolean
  }>({
    rtcPeerConnection: true,
    getUserMedia: true,
    mediaDevices: true,
    mediaRecorder: true,
  })

  useEffect(() => {
    // Check for RTCPeerConnection support
    const hasRTCPeerConnection = typeof RTCPeerConnection !== "undefined"

    // Check for getUserMedia support
    const hasGetUserMedia = !!(
      navigator.mediaDevices?.getUserMedia ||
      (navigator as any).webkitGetUserMedia ||
      (navigator as any).mozGetUserMedia ||
      (navigator as any).msGetUserMedia
    )

    // Check for mediaDevices support
    const hasMediaDevices = !!navigator.mediaDevices

    // Check for MediaRecorder support
    const hasMediaRecorder = typeof MediaRecorder !== "undefined"

    const supportDetails = {
      rtcPeerConnection: hasRTCPeerConnection,
      getUserMedia: hasGetUserMedia,
      mediaDevices: hasMediaDevices,
      mediaRecorder: hasMediaRecorder,
    }

    setDetails(supportDetails)

    // WebRTC is considered supported if we have the core features
    setIsSupported(hasRTCPeerConnection && hasGetUserMedia && hasMediaDevices)
  }, [])

  return { isSupported, details }
}
