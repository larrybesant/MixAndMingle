import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Globe, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section styled like the flyer */}
      <section className="relative py-20 md:py-32 lg:py-40 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-orange-900/30"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black to-transparent"></div>
        </div>

        {/* DJ image */}
        <div className="absolute right-0 bottom-0 w-full md:w-1/2 h-[60%] z-0">
          <div className="relative w-full h-full">
            <img
              src="/dj-with-headphones.png"
              alt="DJ with headphones"
              className="absolute bottom-0 right-0 object-cover object-center h-full w-full opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black"></div>
          </div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-3xl space-y-8">
            {/* MIX & MINGLE style header */}
            <div className="flex items-center justify-start space-x-3">
              <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-orange-500">MIX</span>
              <span className="text-4xl md:text-5xl lg:text-6xl text-orange-500">&</span>
              <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-500">MINGLE</span>
            </div>

            {/* Stream Live DJs */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter">Stream Live DJs</h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-400">
              Dance and chill in virtual rooms with DJs from around the world.
            </p>

            {/* Beta Access Banner - NEW */}
            <div className="bg-gradient-to-r from-blue-600/30 to-orange-600/30 p-4 rounded-lg border border-blue-500/30 animate-pulse">
              <h2 className="text-xl font-bold text-white mb-2">🎉 Beta Testing Now Open!</h2>
              <p className="text-gray-300 mb-4">
                Be among the first to experience MIX & MINGLE. Limited spots available!
              </p>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white rounded-full px-8 py-6 text-lg"
              >
                <Link href="/signup">
                  Join Beta Test <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Browse Rooms button */}
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 text-lg"
            >
              <Link href="/streams">Browse Streams</Link>
            </Button>

            {/* Available worldwide */}
            <div className="flex items-center space-x-2 text-gray-400">
              <Globe className="h-5 w-5" />
              <span>Available worldwide</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-gray-950">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-500 text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Find Live DJ Sets</h3>
              <p className="text-gray-400">
                Discover DJs streaming live right now or check upcoming scheduled streams.
              </p>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-orange-500 text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Join the Party</h3>
              <p className="text-gray-400">Connect with other listeners, request songs, and chat in real-time.</p>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-purple-500 text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Stream Your Own Sets</h3>
              <p className="text-gray-400">Create a DJ profile and broadcast your music to listeners worldwide.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-blue-900 to-purple-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center text-white">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to Experience Live Music?</h2>
              <p className="mx-auto max-w-[600px] text-white/80">
                Join our beta test today and connect with DJs and music lovers around the world.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8">
                <Link href="/signup">Join Beta Test</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-transparent text-white border-white hover:bg-white/10 rounded-full px-8"
              >
                <Link href="/signin">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* DJ Section */}
      <section className="py-12 md:py-16 bg-black">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-500">For DJs</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-white">Share Your Music</h2>
              <p className="text-gray-400">
                Create a DJ profile, schedule live streams, and connect with listeners. Our platform offers high-quality
                streaming with adaptive bandwidth technology.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button
                  asChild
                  className="bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 rounded-full"
                >
                  <Link href="/signup">Join Beta as DJ</Link>
                </Button>
                <Button asChild variant="outline" className="text-white border-white/20 hover:bg-white/10 rounded-full">
                  <Link href="/beta-guide">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-900">
              <img src="/placeholder-l1o6a.png" alt="DJ equipment" className="object-cover w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-bold text-lg">Start streaming in minutes</p>
                <p className="text-gray-300 text-sm">High-quality, low-latency streaming technology</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
