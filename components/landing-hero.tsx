import { Button } from "@/components/ui/button"
import Link from "next/link"

export function LandingHero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-5xl xl:text-6xl/none">
                <span className="text-orange-500">MIX</span> <span className="text-blue-500">&</span>{" "}
                <span className="text-white">MINGLE</span>
              </h1>
              <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl">
                Connect Through Music
              </h2>
              <p className="max-w-[600px] text-gray-300 md:text-xl">
                Find like-minded people, join virtual DJ rooms, and experience music together. The perfect blend of
                social networking and live music events.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-950"
                asChild
              >
                <Link href="/streams">Browse Streams</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <img
              src="/dj-mixing-console.png"
              width={550}
              height={450}
              alt="DJ at mixing console with headphones"
              className="rounded-xl object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
