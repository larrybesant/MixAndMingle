import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Logo } from "@/components/logo"

export const metadata: Metadata = {
  title: "You're Invited to Mix & Mingle Beta | Join Our Exclusive Testing Program",
  description:
    "Join the Mix & Mingle beta testing program and help shape the future of social networking for music lovers and creators.",
}

export default function BetaInvitePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 py-8 mx-auto">
        <header className="flex items-center justify-between mb-8">
          <Logo />
          <div className="flex items-center gap-4">
            <Link href="/beta">
              <Button variant="ghost">About Beta</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          </div>
        </header>

        <main className="grid gap-12 md:grid-cols-2 items-center py-12">
          <div className="space-y-6">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-2">
              Exclusive Beta Access
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              You&apos;re invited to join the Mix & Mingle Beta
            </h1>
            <p className="text-xl text-muted-foreground">
              Be among the first to experience the future of social networking for music lovers and creators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/beta/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Join the Beta
                </Button>
              </Link>
              <Link href="/beta/learn-more">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
            <Image src="/beta-hero.png" alt="Mix & Mingle Beta Preview" fill className="object-cover" priority />
          </div>
        </main>

        <section className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Join Our Beta?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 text-primary mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-sparkles"
                  >
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    <path d="M5 3v4" />
                    <path d="M19 17v4" />
                    <path d="M3 5h4" />
                    <path d="M17 19h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Early Access</h3>
                <p className="text-muted-foreground">
                  Get exclusive access to features before they're available to the general public.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 text-primary mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-message-square"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Shape the Future</h3>
                <p className="text-muted-foreground">
                  Your feedback directly influences the development of Mix & Mingle.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 text-primary mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-gift"
                  >
                    <polyline points="20 12 20 22 4 22 4 12" />
                    <rect width="20" height="5" x="2" y="7" />
                    <line x1="12" x2="12" y1="22" y2="7" />
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Exclusive Rewards</h3>
                <p className="text-muted-foreground">
                  Earn badges, points, and special perks only available to beta testers.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-16 border-t">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">How It Works</h2>
            <ol className="space-y-8">
              <li className="flex items-start gap-4">
                <div className="rounded-full w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground font-bold shrink-0">
                  1
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold mb-1">Register for the Beta</h3>
                  <p className="text-muted-foreground">
                    Click the "Join the Beta" button and create your account with your invitation code.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="rounded-full w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground font-bold shrink-0">
                  2
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold mb-1">Complete Your Profile</h3>
                  <p className="text-muted-foreground">
                    Set up your profile with your music preferences and interests.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="rounded-full w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground font-bold shrink-0">
                  3
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold mb-1">Explore and Provide Feedback</h3>
                  <p className="text-muted-foreground">
                    Try out the features and let us know what you think through the in-app feedback system.
                  </p>
                </div>
              </li>
            </ol>
            <div className="mt-12">
              <Link href="/beta/register">
                <Button size="lg">Join the Beta Now</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 border-t">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2">How long will the beta last?</h3>
                <p className="text-muted-foreground">
                  The beta program is expected to run for 3 months, but beta testers will receive special benefits when
                  we launch.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Is there a cost to join the beta?</h3>
                <p className="text-muted-foreground">
                  No, the beta program is completely free. Beta testers get access to all premium features at no cost
                  during the testing period.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">What kind of feedback are you looking for?</h3>
                <p className="text-muted-foreground">
                  We want to hear about your experience with the platform, any bugs you encounter, and suggestions for
                  improvements or new features.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Do I need an invitation code?</h3>
                <p className="text-muted-foreground">
                  Yes, you'll need an invitation code to join the beta. If you received this link, your invitation code
                  should have been provided to you.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t py-8">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Logo />
              <span className="text-sm text-muted-foreground">© 2025 Mix & Mingle. All rights reserved.</span>
            </div>
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
        </div>
      </footer>
    </div>
  )
}
