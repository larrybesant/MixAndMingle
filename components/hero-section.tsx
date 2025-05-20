import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Connect, Chat & Share on Mix & Mingle
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Join our vibrant community where you can meet new friends, join chat rooms, and experience premium video
                and audio conversations.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/signup">
                <Button size="lg" className="w-full">
                  Get Started
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline" className="w-full">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <img
              alt="Mix & Mingle Platform Preview"
              className="aspect-video overflow-hidden rounded-xl object-cover object-center"
              src="/social-network-chat.png"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
