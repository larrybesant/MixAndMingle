import Link from "next/link"
import LogoLarge from "./logo-large"
import { Facebook, Instagram, Twitter, Globe, Lightbulb, Bug } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-gray-800">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="flex flex-col items-center lg:items-start">
            <LogoLarge />
            <p className="mt-4 text-sm text-gray-400 text-center lg:text-left">
              Stream, connect, and celebrate with DJs and music lovers worldwide.
            </p>
            <div className="flex mt-6 space-x-4">
              <Link href="#" className="text-gray-400 hover:text-orange-500">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-blue-500">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-orange-500">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 lg:col-span-3">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white">Features</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/events" className="text-sm text-gray-400 hover:text-orange-500">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="/friends" className="text-sm text-gray-400 hover:text-blue-500">
                    Friends
                  </Link>
                </li>
                <li>
                  <Link href="/chat-rooms" className="text-sm text-gray-400 hover:text-orange-500">
                    Chat Rooms
                  </Link>
                </li>
                <li>
                  <Link href="/streams" className="text-sm text-gray-400 hover:text-blue-500">
                    Live Streams
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white">For DJs</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dj-profile" className="text-sm text-gray-400 hover:text-orange-500">
                    Create DJ Profile
                  </Link>
                </li>
                <li>
                  <Link href="/dj/streams" className="text-sm text-gray-400 hover:text-blue-500">
                    Manage Streams
                  </Link>
                </li>
                <li>
                  <Link href="/admin/streaming-testing" className="text-sm text-gray-400 hover:text-orange-500">
                    Streaming Guide
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white">Beta Program</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/beta-guide" className="text-sm text-gray-400 hover:text-orange-500 flex items-center">
                    <Bug className="h-3.5 w-3.5 mr-1.5" />
                    Beta Tester Guide
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="text-sm text-gray-400 hover:text-blue-500 flex items-center">
                    <Bug className="h-3.5 w-3.5 mr-1.5" />
                    Submit Feedback
                  </Link>
                </li>
                <li>
                  <Link
                    href="/feature-voting"
                    className="text-sm text-gray-400 hover:text-orange-500 flex items-center"
                  >
                    <Lightbulb className="h-3.5 w-3.5 mr-1.5" />
                    Feature Voting
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/beta-dashboard"
                    className="text-sm text-gray-400 hover:text-blue-500 flex items-center"
                  >
                    <Bug className="h-3.5 w-3.5 mr-1.5" />
                    Beta Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="pt-8 mt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} MIX & MINGLE. All rights reserved.
            </p>
            <div className="flex items-center mt-4 md:mt-0 text-sm text-gray-400">
              <Globe className="h-4 w-4 mr-2" />
              <span>Available worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
