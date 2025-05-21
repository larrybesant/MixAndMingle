"use client"

import { useEffect, useState } from "react"
import ReactConfetti from "react-confetti"

export function Confetti() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    // Set dimensions on mount
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    // Update dimensions on resize
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <ReactConfetti
      width={dimensions.width}
      height={dimensions.height}
      recycle={false}
      numberOfPieces={200}
      gravity={0.2}
    />
  )
}
