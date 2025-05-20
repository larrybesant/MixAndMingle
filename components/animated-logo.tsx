"use client"

import { useEffect, useRef } from "react"
import { Music } from "lucide-react"

export function AnimatedLogo() {
  const logoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const logo = logoRef.current
    if (!logo) return

    // Add animation class after component mounts
    setTimeout(() => {
      logo.classList.add("animate-in")
    }, 100)

    // Set up intersection observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-pulse-glow")
          } else {
            entry.target.classList.remove("animate-pulse-glow")
          }
        })
      },
      { threshold: 0.5 },
    )

    const musicIcon = logo.querySelector(".music-icon")
    if (musicIcon) {
      observer.observe(musicIcon)
    }

    return () => {
      if (musicIcon) {
        observer.unobserve(musicIcon)
      }
    }
  }, [])

  return (
    <div ref={logoRef} className="flex items-center gap-1 transition-all duration-700 opacity-0 translate-y-4 scale-95">
      <span className="text-3xl font-bold neon-text-orange">MIX</span>
      <Music className="h-8 w-8 text-secondary music-icon" />
      <span className="text-3xl font-bold neon-text-blue">MINGLE</span>
    </div>
  )
}
