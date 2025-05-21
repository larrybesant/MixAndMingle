import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { FlameIcon as FireIcon, DropletIcon } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center mb-6">Mix & Mingle</h1>
        <p className="text-center mb-6">Minimal version for testing deployment</p>
        <div className="space-y-4">
          <Link
            href="/features"
            className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-md"
          >
            Features
          </Link>
          <Link
            href="/about"
            className="block w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 text-center rounded-md dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            About
          </Link>
        </div>
      </div>

      <header className="container py-6 mt-12">
        <div className="flex justify-between items-center">
          <Logo />
          <Link href="/login">
            <Button variant="outline" className="neon-border rounded-full px-6">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-20 text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6">Stream Live DJs</h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Join live DJ sets from around the world. Chat and mingle with other music lovers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-lg neon-glow">
              Browse Rooms
            </Button>
            <Button
              variant="outline"
              className="bg-transparent border-accent text-accent hover:bg-accent/10 rounded-full px-8 py-6 text-lg neon-border-purple"
            >
              Go Live
            </Button>
          </div>

          <div className="relative rounded-xl overflow-hidden max-w-4xl mx-auto">
            <img src="/dj-hero.jpg" alt="DJ performing live" className="w-full object-cover rounded-xl" />
            <div className="absolute bottom-0 right-0 p-4 bg-black/60 backdrop-blur-sm rounded-tl-xl">
              <div className="flex items-center gap-2 mb-2">
                <DropletIcon className="h-5 w-5 text-primary" />
                <span className="font-medium">truegrooves</span>
                <FireIcon className="h-5 w-5 text-secondary" />
              </div>
              <p className="text-sm text-muted-foreground">Love this set!</p>
            </div>
          </div>
        </section>

        <section className="container py-16">
          <h2 className="text-4xl font-bold mb-10">Live DJ Rooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Room 1 */}
            <div className="rounded-xl overflow-hidden bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="relative">
                <img src="/dj-room-1.png" alt="Electronic Voyage" className="w-full aspect-video object-cover" />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold">Electronic Voyage</h3>
                <p className="text-muted-foreground">by selectors</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">120 viewers</span>
                </div>
              </div>
            </div>

            {/* Room 2 */}
            <div className="rounded-xl overflow-hidden bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="relative">
                <img src="/dj-room-2.png" alt="Hip Hop Grooves" className="w-full aspect-video object-cover" />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold">Hip Hop Grooves</h3>
                <p className="text-muted-foreground">DJ FreshBeats</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">63 viewers</span>
                </div>
              </div>
            </div>

            {/* Room 3 */}
            <div className="rounded-xl overflow-hidden bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="relative">
                <img src="/dj-room-3.png" alt="Soulful Sounds" className="w-full aspect-video object-cover" />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold">Soulful Sounds</h3>
                <p className="text-muted-foreground">DJ Harmony</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">78 viewers</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-12">
            <Button className="bg-background border border-muted hover:bg-muted/20 text-foreground rounded-full px-8 py-6 text-lg">
              Create a Room
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-muted py-6">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2025 Mix & Mingle. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
