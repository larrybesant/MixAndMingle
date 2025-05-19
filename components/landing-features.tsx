import { Users, Music, MessageSquare, Calendar, Heart, Headphones } from "lucide-react"

export function LandingFeatures() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-900">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-5xl">Features</h2>
            <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              The perfect platform to connect with others and enjoy music together
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-white">Smart Matchmaking</h3>
            <p className="text-center text-gray-400">
              Our AI-powered algorithm connects you with people who share your music tastes and interests.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10">
              <Headphones className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-white">Live DJ Streams</h3>
            <p className="text-center text-gray-400">
              Experience live DJ sets from around the world and interact with other listeners in real-time.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10">
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-white">Chat Rooms</h3>
            <p className="text-center text-gray-400">
              Join themed chat rooms to discuss music, find new friends, or just hang out.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-white">Music Events</h3>
            <p className="text-center text-gray-400">
              Discover and join virtual and in-person music events that match your preferences.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10">
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-white">Connections</h3>
            <p className="text-center text-gray-400">
              Build meaningful connections with people who share your passion for music.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10">
              <Music className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-white">Music Profiles</h3>
            <p className="text-center text-gray-400">
              Create a profile that showcases your music taste, favorite genres, and artists.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
