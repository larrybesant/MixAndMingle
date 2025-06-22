"use client"

import React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Music,
  Mic,
  Camera,
  Settings,
  Play,
  Users,
  Gamepad2,
  BookOpen,
  Coffee,
  Palette,
  Plus,
  Hash,
  Globe,
  Lock,
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
// import { LiveStream } from "@/components/streaming/live-stream"

export default function GoLivePage() {
  const [roomData, setRoomData] = useState({
    name: "",
    description: "",
    category: "Music",    genre: "Electronic",
    isPrivate: false,
    tags: [] as string[],
    maxViewers: 100,
  })
  const [isLive, setIsLive] = useState(false)
  const [viewers, setViewers] = useState(0)
  const [newTag, setNewTag] = useState("")
  const [goLiveError, setGoLiveError] = useState<string | null>(null)

  const categories = [
    {
      name: "Music",
      icon: <Music className="w-4 h-4" />,
      genres: [
        "Electronic",
        "Hip-Hop",
        "House",
        "Techno",
        "Ambient",
        "Jazz",
        "Rock",
        "Pop",
        "R&B",
        "Reggae",
        "Country",
        "Classical",
        "Blues",
        "Funk",
        "Disco",
        "Trance",
        "Dubstep",
        "Drum & Bass",
        "Garage",
        "Trap",
        "Lo-Fi",
        "Indie",
        "Alternative",
        "Punk",
        "Metal",
      ],
    },
    {
      name: "Talk Show",
      icon: <Mic className="w-4 h-4" />,
      genres: [
        "Podcast",
        "Interview",
        "Comedy",
        "News",
        "Politics",
        "Sports",
        "Technology",
        "Lifestyle",
        "Health",
        "Business",
        "Education",
        "Storytelling",
        "Debate",
        "Q&A",
      ],
    },
    {
      name: "Gaming",
      icon: <Gamepad2 className="w-4 h-4" />,
      genres: [
        "FPS",
        "RPG",
        "Strategy",
        "Racing",
        "Sports",
        "Fighting",
        "Puzzle",
        "Adventure",
        "Simulation",
        "MMO",
        "Battle Royale",
        "Indie Games",
        "Retro Gaming",
        "Mobile Games",
      ],
    },
    {
      name: "Creative",
      icon: <Palette className="w-4 h-4" />,
      genres: [
        "Art",
        "Drawing",
        "Painting",
        "Digital Art",
        "Photography",
        "Design",
        "Crafts",
        "Writing",
        "Poetry",
        "Fashion",
        "Makeup",
        "Cooking",
        "Baking",
        "DIY",
      ],
    },
    {
      name: "Learning",
      icon: <BookOpen className="w-4 h-4" />,
      genres: [
        "Tutorial",
        "Language",
        "Programming",
        "Math",
        "Science",
        "History",
        "Philosophy",
        "Self-Help",
        "Fitness",
        "Yoga",
        "Meditation",
        "Study Session",
        "Book Club",
      ],
    },
    {
      name: "Social",
      icon: <Coffee className="w-4 h-4" />,
      genres: [
        "Hangout",
        "Chat",
        "Dating",
        "Networking",
        "Community",
        "Support Group",
        "Virtual Party",
        "Game Night",
        "Movie Watch",
        "Just Chatting",
        "AMA",
      ],
    },
  ]

  const selectedCategory = categories.find((cat) => cat.name === roomData.category)

  const addTag = () => {
    if (newTag.trim() && !roomData.tags.includes(newTag.trim()) && roomData.tags.length < 5) {
      setRoomData({ ...roomData, tags: [...roomData.tags, newTag.trim()] })
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setRoomData({ ...roomData, tags: roomData.tags.filter((tag) => tag !== tagToRemove) })
  }
  const handleGoLive = async (e: React.FormEvent) => {
    e.preventDefault()
    setGoLiveError(null)
    if (!roomData.name.trim()) {
      setGoLiveError("Room name is required.")
      return
    }
    
    try {
      // Check user authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        setGoLiveError("Please log in to create a room.")
        return
      }

      // Create a unique room ID
      const roomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        // Create the room in database
      const { error } = await supabase
        .from("dj_rooms")
        .insert({
          id: roomId,
          name: roomData.name,
          genre: roomData.genre,
          is_live: true,
          viewer_count: 0,
          host_id: user.id,
          description: roomData.description,
          tags: roomData.tags,
        })
        .select()
        .single()

      if (error) {
        console.error('Room creation error:', error)
        setGoLiveError("Failed to create room. Please try again.")
        return
      }      // Start the live stream UI
      setIsLive(true)
      setViewers(1)
      
      // Create Daily.co room immediately
      try {
        const dailyResponse = await fetch('/api/daily-room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId }),
        });

        if (dailyResponse.ok) {
          const dailyData = await dailyResponse.json();
          // Update room with Daily.co URL
          await supabase
            .from("dj_rooms")
            .update({ stream_url: dailyData.url })
            .eq('id', roomId);
        }
      } catch (dailyError) {
        console.warn('Daily.co room creation failed:', dailyError);
      }
      
      // Optionally redirect to room view after a short delay
      setTimeout(() => {
        window.location.href = `/room/${roomId}`
      }, 2000)
      
    } catch (err) {
      console.error('Go live error:', err)
      setGoLiveError("An error occurred. Please try again.")
    }
  }
  const handleStopStream = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Update room status to not live
        await supabase
          .from("dj_rooms")
          .update({ 
            is_live: false, 
            viewer_count: 0 
          })
          .eq('host_id', user.id)
          .eq('is_live', true)
      }
    } catch (error) {
      console.error('Error stopping stream:', error)
    }
    
    setIsLive(false)
    setViewers(0)
  }

  return (
    <div className="min-h-screen gradient-bg text-white">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Music className="w-8 h-8 text-orange-400 animate-pulse" />
          <h1 className="text-2xl font-bold">
            <span className="text-transparent bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text">
              Mix & Mingle
            </span>
          </h1>
        </div>
        <div className="flex space-x-4">
          <Link href="/dashboard">
            <Button variant="outline" className="border-gray-600 text-gray-300">
              Dashboard
            </Button>
          </Link>
          <Link href="/discover">
            <Button variant="outline" className="border-gray-600 text-gray-300">
              Discover
            </Button>
          </Link>
        </div>
      </nav>

      <div className="p-6">
        {!isLive ? (
          <>
            {/* Setup Section */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 neon-text">Create Your Room 🎤</h1>
              <p className="text-gray-400">Set up your custom room and start streaming!</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Room Setup */}
              <Card className="card-glow">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Settings className="w-6 h-6 text-neon-blue mr-2" />
                    Room Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Room Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Room Name *</label>
                    <Input
                      type="text"
                      placeholder="Friday Night Vibes, Study Session, Art Stream..."
                      value={roomData.name}
                      onChange={(e) => setRoomData({ ...roomData, name: e.target.value })}
                      className="bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-neon-blue"
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-500 mt-1">{roomData.name.length}/50 characters</p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <Textarea
                      placeholder="Tell your audience what you'll be doing..."
                      value={roomData.description}
                      onChange={(e) => setRoomData({ ...roomData, description: e.target.value })}
                      className="bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-neon-blue"
                      rows={3}
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">{roomData.description.length}/200 characters</p>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={roomData.category}
                      onChange={(e) => {
                        const newCategory = e.target.value
                        const categoryData = categories.find((cat) => cat.name === newCategory)
                        setRoomData({
                          ...roomData,
                          category: newCategory,
                          genre: categoryData?.genres[0] || "",
                        })
                      }}
                      className="w-full p-2 bg-black/50 border border-gray-600 rounded-md text-white focus:border-neon-blue"
                    >
                      {categories.map((category) => (
                        <option key={category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Genre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {roomData.category === "Music" ? "Genre" : "Type"}
                    </label>
                    <select
                      value={roomData.genre}
                      onChange={(e) => setRoomData({ ...roomData, genre: e.target.value })}
                      className="w-full p-2 bg-black/50 border border-gray-600 rounded-md text-white focus:border-neon-blue"
                    >
                      {selectedCategory?.genres.map((genre) => (
                        <option key={genre} value={genre}>
                          {genre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tags (Optional)</label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        type="text"
                        placeholder="Add a tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addTag()}
                        className="bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-neon-blue flex-1"
                        maxLength={20}
                      />
                      <Button
                        onClick={addTag}
                        disabled={!newTag.trim() || roomData.tags.length >= 5}
                        className="bg-neon-blue hover:bg-neon-blue/80"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {roomData.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-neon-purple/20 text-neon-purple border-neon-purple/30 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        >
                          <Hash className="w-3 h-3 mr-1" />
                          {tag}
                          <span className="ml-1 text-xs">×</span>
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Click tags to remove • Max 5 tags</p>
                  </div>

                  {/* Privacy & Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                      <div className="flex items-center">
                        {roomData.isPrivate ? (
                          <Lock className="w-5 h-5 text-neon-pink mr-3" />
                        ) : (
                          <Globe className="w-5 h-5 text-neon-green mr-3" />
                        )}
                        <div>
                          <span className="text-white font-medium">
                            {roomData.isPrivate ? "Private Room" : "Public Room"}
                          </span>
                          <p className="text-xs text-gray-400">
                            {roomData.isPrivate ? "Invite only" : "Anyone can join"}
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={roomData.isPrivate}
                        onChange={(e) => setRoomData({ ...roomData, isPrivate: e.target.checked })}
                        className="rounded border-gray-600 bg-black/50 text-neon-blue focus:ring-neon-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Max Viewers</label>
                      <select
                        value={roomData.maxViewers}
                        onChange={(e) => setRoomData({ ...roomData, maxViewers: Number.parseInt(e.target.value) })}
                        className="w-full p-2 bg-black/50 border border-gray-600 rounded-md text-white focus:border-neon-blue"
                      >
                        <option value={50}>50 viewers</option>
                        <option value={100}>100 viewers</option>
                        <option value={250}>250 viewers</option>
                        <option value={500}>500 viewers</option>
                        <option value={1000}>1000 viewers</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Equipment Check & Preview */}
              <Card className="card-glow">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Camera className="w-6 h-6 text-neon-purple mr-2" />
                    Equipment & Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Room Preview */}
                  <div className="p-4 bg-black/30 rounded-lg border border-gray-700">
                    <h3 className="text-white font-semibold mb-2">Room Preview</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Name:</span>
                        <span className="text-white font-medium">{roomData.name || "Untitled Room"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Category:</span>
                        <Badge className="bg-neon-purple/20 text-neon-purple">{roomData.category}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Genre:</span>
                        <Badge className="bg-neon-blue/20 text-neon-blue">{roomData.genre}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Privacy:</span>
                        <Badge
                          className={
                            roomData.isPrivate ? "bg-neon-pink/20 text-neon-pink" : "bg-neon-green/20 text-neon-green"
                          }
                        >
                          {roomData.isPrivate ? "Private" : "Public"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Equipment Status */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                      <div className="flex items-center">
                        <Mic className="w-5 h-5 text-neon-green mr-3" />
                        <span className="text-white">Microphone</span>
                      </div>
                      <span className="text-neon-green font-semibold">✓ Ready</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                      <div className="flex items-center">
                        <Camera className="w-5 h-5 text-neon-green mr-3" />
                        <span className="text-white">Camera</span>
                      </div>
                      <span className="text-neon-green font-semibold">✓ Ready</span>
                    </div>

                    {roomData.category === "Music" && (
                      <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                        <div className="flex items-center">
                          <Music className="w-5 h-5 text-neon-green mr-3" />
                          <span className="text-white">Audio Interface</span>
                        </div>
                        <span className="text-neon-green font-semibold">✓ Ready</span>
                      </div>
                    )}
                  </div>

                  {/* Pro Tips */}
                  <div className="p-4 bg-neon-blue/10 border border-neon-blue/30 rounded-lg">
                    <p className="text-sm text-neon-blue mb-2">💡 Pro Tips:</p>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• Choose a clear, descriptive room name</li>
                      <li>• Add relevant tags to help people find you</li>
                      <li>• Test your audio/video before going live</li>
                      <li>• Engage with your audience through chat</li>
                    </ul>
                  </div>

                  {/* Go Live Button */}
                  <Button
                    onClick={handleGoLive}
                    className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white font-bold py-4 text-lg neon-glow"
                    disabled={!roomData.name.trim()}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Go Live with &quot;{roomData.name || "Your Room"}&quot;!
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            {/* Live Stream Interface */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2 neon-text">🔴 You&apos;re Live!</h1>
                  <p className="text-gray-400">{roomData.name}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge className="bg-neon-purple/20 text-neon-purple">{roomData.category}</Badge>
                    <Badge className="bg-neon-blue/20 text-neon-blue">{roomData.genre}</Badge>
                    {roomData.isPrivate && (
                      <Badge className="bg-neon-pink/20 text-neon-pink">
                        <Lock className="w-3 h-3 mr-1" />
                        Private
                      </Badge>
                    )}
                    {roomData.tags.map((tag) => (
                      <Badge key={tag} className="bg-gray-700/50 text-gray-300">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-black/50 px-4 py-2 rounded-lg">
                    <Users className="w-5 h-5 text-neon-green mr-2" />
                    <span className="text-white font-bold">
                      {viewers} / {roomData.maxViewers}
                    </span>
                  </div>
                  <Button onClick={handleStopStream} variant="destructive" className="bg-red-600 hover:bg-red-700">
                    End Stream
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Video Feed */}
              <div className="lg:col-span-2">
                <Card className="card-glow">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative">
                      <div className="text-center">
                        {selectedCategory?.icon && (
                          <div className="text-6xl text-gray-600 mb-4">
                            {React.cloneElement(selectedCategory.icon, { className: "w-16 h-16 mx-auto" })}
                          </div>
                        )}
                        <p className="text-gray-400">Your {roomData.category.toLowerCase()} stream would appear here</p>
                        <p className="text-sm text-gray-500 mt-2">Room: {roomData.name}</p>
                      </div>
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                        LIVE
                      </div>
                      <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        {viewers} viewers
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chat & Controls */}
              <div className="space-y-6">
                <Card className="card-glow">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Live Chat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-black/30 rounded-lg p-4 mb-4 overflow-y-auto">
                      <div className="space-y-2 text-sm">
                        <div className="text-neon-blue">viewer123: Great room name! 🔥</div>
                        <div className="text-neon-green">fan456: Love the setup!</div>
                        <div className="text-neon-purple">user789: This is awesome!</div>
                        <div className="text-neon-pink">guest101: How did you create this room?</div>
                      </div>
                    </div>
                    <Input
                      placeholder="Chat with your audience..."
                      className="bg-black/50 border-gray-600 text-white placeholder-gray-400"
                    />
                  </CardContent>
                </Card>

                <Card className="card-glow">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Room Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration</span>
                        <span className="text-white">00:15:32</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Peak Viewers</span>
                        <span className="text-neon-green">{Math.max(viewers, 1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Likes</span>
                        <span className="text-neon-pink">47</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Room Name</span>
                        <span className="text-neon-purple text-sm">{roomData.name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
