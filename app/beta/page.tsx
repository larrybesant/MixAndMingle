"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export default function BetaTestingPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmitFeedback = async () => {
    // Submit feedback logic here
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black mb-4">
            <span className="text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.8)]">MIX</span>
            <span className="text-orange-400 text-7xl mx-2">🎵</span>
            <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">MINGLE</span>
          </h1>
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-full inline-block font-bold text-xl mb-4">
            🚀 BETA TESTING
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Welcome to the exclusive beta test of Mix & Mingle! Help us perfect the ultimate DJ streaming and social
            platform.
          </p>
        </div>

        {/* Beta Testing Info */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-black/60 border border-purple-500/30 backdrop-blur-sm rounded-lg p-6">
            <div className="mb-4">
              <h2 className="text-2xl text-purple-400 font-semibold">🎯 What to Test</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <div>
                  <strong>User Registration</strong>
                  <p className="text-sm">Sign up, email verification, profile setup</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <div>
                  <strong>DJ Room Discovery</strong>
                  <p className="text-sm">Browse live rooms, join streams</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <div>
                  <strong>Live Streaming</strong>
                  <p className="text-sm">Go live, webcam/audio, viewer interaction</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <div>
                  <strong>Real-time Chat</strong>
                  <p className="text-sm">Chat in rooms, emoji reactions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400">✓</span>
                <div>
                  <strong>Mobile Experience</strong>
                  <p className="text-sm">Test on phones and tablets</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/60 border border-cyan-500/30 backdrop-blur-sm rounded-lg p-6">
            <div className="mb-4">
              <h2 className="text-2xl text-cyan-400 font-semibold">🐛 Report Issues</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-start gap-3">
                <span className="text-red-400">!</span>
                <div>
                  <strong>Bugs & Crashes</strong>
                  <p className="text-sm">Any errors, broken features, or crashes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-400">⚡</span>
                <div>
                  <strong>Performance Issues</strong>
                  <p className="text-sm">Slow loading, lag, streaming problems</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400">💡</span>
                <div>
                  <strong>UX Improvements</strong>
                  <p className="text-sm">Confusing UI, missing features, suggestions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400">📱</span>
                <div>
                  <strong>Device Compatibility</strong>
                  <p className="text-sm">Issues on specific browsers/devices</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Links */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30 mb-12 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-2xl text-center text-white font-semibold">🚀 Quick Access</h2>
          </div>
          <div>
            <div className="grid md:grid-cols-4 gap-4">
              <Link href="/signup">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3">📝 Sign Up</Button>
              </Link>
              <Link href="/discover">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3">
                  🎵 Browse Rooms
                </Button>
              </Link>
              <Link href="/go-live">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3">📺 Go Live</Button>
              </Link>
              <Link href="/dashboard">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3">
                  👤 Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <div className="bg-black/60 border border-orange-500/30 backdrop-blur-sm rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-2xl text-orange-400 font-semibold">💬 Submit Feedback</h2>
          </div>
          <div>
            {!submitted ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-gray-900/50 border-orange-500/30 text-white"
                  />
                  <Input
                    placeholder="Your Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-900/50 border-orange-500/30 text-white"
                  />
                </div>
                <Textarea
                  placeholder="Describe any bugs, issues, or suggestions you have..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="bg-gray-900/50 border-orange-500/30 text-white min-h-32"
                />
                <Button
                  onClick={handleSubmitFeedback}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3"
                >
                  🚀 Submit Feedback
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-green-400 mb-2">Thank You!</h3>
                <p className="text-gray-300">Your feedback has been submitted. We appreciate your help!</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-12 text-gray-400">
          <p>
            Need help? Contact us at{" "}
            <a href="mailto:beta@djmixandmingle.com" className="text-blue-400 hover:underline">
              beta@djmixandmingle.com
            </a>
          </p>
          <p className="text-sm mt-2">Beta Version 1.0 | Build Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}
