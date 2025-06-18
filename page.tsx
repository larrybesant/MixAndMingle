"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Play, Users, Heart, Share2, Music, Headphones, Radio, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div className="min-h-screen bg-black" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Navigation */}
      <nav className="border-b border-purple-500/20 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Mix & Mingle
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-purple-300 hover:text-white hover:bg-purple-500/20">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-4">
              <Zap className="w-4 h-4 mr-1" />
              Where Music Meets Connection
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
                Mix & Mingle
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join live DJ streams, discover new music, and connect with fellow music lovers in real-time. The ultimate
              nightlife experience, digitally reimagined.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Mixing
              </Button>
            </Link>
            <Link href="/discover">
              <Button
                size="lg"
                variant="outline"
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20 px-8 py-3"
              >
                <Radio className="w-5 h-5 mr-2" />
                Discover Rooms
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Rooms Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">🔥 Live Now</h2>
            <p className="text-gray-400">Join thousands of music lovers in live DJ rooms</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Electronic Vibes",
                dj: "DJ Neon",
                viewers: 1247,
                genre: "Electronic",
                image: "/dj-electronic.jpg",
              },
              {
                title: "Hip-Hop Central",
                dj: "MC Flow",
                viewers: 892,
                genre: "Hip-Hop",
                image: "/dj-hiphop.jpg",
              },
              {
                title: "House Party",
                dj: "DJ Pulse",
                viewers: 634,
                genre: "House",
                image: "/dj-featured.jpg",
              },
            ].map((room, index) => (
              <Card
                key={index}
                className="bg-black/40 border-purple-500/20 backdrop-blur-sm hover:border-purple-500/40 transition-all duration-300 group cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={room.image || "/placeholder.svg"}
                    alt={room.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-red-500 text-white animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full mr-1" />
                      LIVE
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-black/60 text-white">
                      <Users className="w-3 h-3 mr-1" />
                      {room.viewers.toLocaleString()}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white group-hover:text-purple-300 transition-colors">
                      {room.title}
                    </CardTitle>
                    <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                      {room.genre}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center text-gray-400">
                    <Avatar className="w-6 h-6 mr-2">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>{room.dj[0]}</AvatarFallback>
                    </Avatar>
                    {room.dj}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white">
                      <Headphones className="w-4 h-4 mr-1" />
                      Join Room
                    </Button>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-blue-400">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-900/10 to-blue-900/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Mix & Mingle?</h2>
            <p className="text-gray-400">The ultimate platform for music lovers and DJs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Radio className="w-8 h-8 text-purple-400" />,
                title: "Live DJ Streams",
                description: "Experience real-time DJ performances with crystal clear audio",
              },
              {
                icon: <Users className="w-8 h-8 text-blue-400" />,
                title: "Real-Time Chat",
                description: "Connect with fellow music lovers and interact with DJs live",
              },
              {
                icon: <Heart className="w-8 h-8 text-green-400" />,
                title: "Music Discovery",
                description: "Discover new genres, artists, and connect with like-minded people",
              },
            ].map((feature, index) => (
              <Card key={index} className="bg-black/20 border-purple-500/20 backdrop-blur-sm text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Musical Journey?</h2>
          <p className="text-xl text-gray-300 mb-8">Join thousands of music lovers already mixing and mingling</p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-12 py-4 text-lg"
            >
              <Play className="w-6 h-6 mr-2" />
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-black/50 backdrop-blur-xl py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Mix & Mingle
            </span>
          </div>
          <p className="text-gray-400 text-sm">© 2025 Mix & Mingle. Where Music Meets Connection.</p>
        </div>
      </footer>
    </div>
  )
}
