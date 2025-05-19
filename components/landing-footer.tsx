import Link from "next/link"

export function LandingFooter() {
  return (
    <footer className="w-full border-t border-gray-800 bg-gray-950 py-6">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium text-white">Mix & Mingle</h3>
            <p className="text-sm text-gray-400">
              Connect with like-minded people and enjoy live music events together.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium text-white">Connect</h3>
            <Link href="/dashboard/explore" className="text-sm text-gray-400 hover:text-white">
              Find Matches
            </Link>
            <Link href="/dashboard/messages" className="text-sm text-gray-400 hover:text-white">
              Messages
            </Link>
            <Link href="/chat-rooms" className="text-sm text-gray-400 hover:text-white">
              Chat Rooms
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium text-white">Music</h3>
            <Link href="/streams" className="text-sm text-gray-400 hover:text-white">
              Live Streams
            </Link>
            <Link href="/events" className="text-sm text-gray-400 hover:text-white">
              Events
            </Link>
            <Link href="/djs" className="text-sm text-gray-400 hover:text-white">
              DJs
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium text-white">Company</h3>
            <Link href="/about" className="text-sm text-gray-400 hover:text-white">
              About
            </Link>
            <Link href="/beta-guide" className="text-sm text-gray-400 hover:text-white">
              Beta Guide
            </Link>
            <Link href="/feedback" className="text-sm text-gray-400 hover:text-white">
              Feedback
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-6">
          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Mix & Mingle. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
