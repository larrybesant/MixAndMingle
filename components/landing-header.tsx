import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">
              <span className="text-orange-500">MIX</span> <span className="text-blue-500">& MINGLE</span>
              <span className="ml-2 rounded-md bg-blue-600 px-1.5 py-0.5 text-xs font-medium uppercase text-white">
                Beta
              </span>
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium text-white hover:text-white/80">
              Home
            </Link>
            <Link href="/events" className="text-sm font-medium text-white/70 hover:text-white">
              Events
            </Link>
            <Link href="/dashboard/explore" className="text-sm font-medium text-white/70 hover:text-white">
              Connect
            </Link>
            <Link href="/streams" className="text-sm font-medium text-white/70 hover:text-white">
              Live Streams
            </Link>
            <Link href="/chat-rooms" className="text-sm font-medium text-white/70 hover:text-white">
              Chat Rooms
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-blue-600 text-blue-500 hover:bg-blue-950" asChild>
            <Link href="/join-beta">Join Beta</Link>
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
