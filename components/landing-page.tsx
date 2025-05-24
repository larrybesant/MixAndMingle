import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Video, MessageCircle, Crown, Music, Calendar, Headphones } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Headphones className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">DJ Mix & Mingle</h1>
          </div>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-white text-purple-600 hover:bg-gray-100">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-white mb-6">Connect, Mix, and Mingle with DJs Worldwide</h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join the ultimate social platform where DJs connect, collaborate, and create amazing music together.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3">
              Start Your DJ Journey
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 text-lg px-8 py-3">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-white text-center mb-12">Everything DJs Need to Connect</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <MessageCircle className="h-12 w-12 text-pink-300 mb-4" />
              <CardTitle>DJ Chat Rooms</CardTitle>
              <CardDescription className="text-white/80">
                Connect with DJs worldwide in genre-specific chat rooms
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <Video className="h-12 w-12 text-blue-300 mb-4" />
              <CardTitle>Live DJ Sessions</CardTitle>
              <CardDescription className="text-white/80">
                Stream your sets live and collaborate with other DJs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <Music className="h-12 w-12 text-green-300 mb-4" />
              <CardTitle>Music Sharing</CardTitle>
              <CardDescription className="text-white/80">
                Share tracks, get feedback, and discover new music
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <Calendar className="h-12 w-12 text-yellow-300 mb-4" />
              <CardTitle>Gig Booking</CardTitle>
              <CardDescription className="text-white/80">Find and book DJ gigs at venues and events</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-300 mb-4" />
              <CardTitle>DJ Network</CardTitle>
              <CardDescription className="text-white/80">
                Build your professional DJ network and collaborations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <Crown className="h-12 w-12 text-orange-300 mb-4" />
              <CardTitle>Premium Features</CardTitle>
              <CardDescription className="text-white/80">
                Unlock exclusive tools, priority booking, and more
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Demo Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">Try Our Platform</h3>
          <p className="text-white/80 mb-8">Explore the features before signing up</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/test-auth">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Test Authentication
              </Button>
            </Link>
            <Link href="/test-realtime-chat">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Try Chat System
              </Button>
            </Link>
            <Link href="/test-webrtc">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Test Video Calls
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-white text-center mb-12">DJ Membership Plans</h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Free DJ</CardTitle>
              <CardDescription className="text-white/80">Perfect for starting DJs</CardDescription>
              <div className="text-4xl font-bold mt-4">$0</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-white/90">
                <li>• Basic chat rooms</li>
                <li>• 1-on-1 video calls</li>
                <li>• Standard profile</li>
                <li>• Community support</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/20 backdrop-blur-md border-white/30 text-white ring-2 ring-yellow-400">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Pro DJ</CardTitle>
              <CardDescription className="text-white/80">Most popular choice</CardDescription>
              <div className="text-4xl font-bold mt-4">
                $9.99<span className="text-lg">/mo</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-white/90">
                <li>• All Free features</li>
                <li>• Group video sessions</li>
                <li>• Music upload & sharing</li>
                <li>• Gig booking access</li>
                <li>• Priority support</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">VIP DJ</CardTitle>
              <CardDescription className="text-white/80">Ultimate DJ experience</CardDescription>
              <div className="text-4xl font-bold mt-4">
                $19.99<span className="text-lg">/mo</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-white/90">
                <li>• All Pro features</li>
                <li>• Live streaming tools</li>
                <li>• Exclusive VIP rooms</li>
                <li>• Advanced analytics</li>
                <li>• Featured profile</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/20 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-white/80">
          <p>&copy; 2024 DJ Mix & Mingle. All rights reserved. Connect. Mix. Mingle.</p>
        </div>
      </footer>
    </div>
  )
}
