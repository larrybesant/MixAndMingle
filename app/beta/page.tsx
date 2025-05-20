import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { BetaFeatures } from "@/components/beta-features"
import { BetaTestimonials } from "@/components/beta-testimonials"
import { BetaFAQ } from "@/components/beta-faq"

export default function BetaPage() {
  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <header className="container py-6">
        <div className="flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" className="neon-border rounded-full px-6">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-20 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary">
            Limited Beta Access
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Help Shape the Future of <span className="text-primary">Mix & Mingle</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Join our exclusive beta program and be among the first to experience the next generation of music streaming
            and social networking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link href="/beta/apply">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-lg neon-glow">
                Apply for Beta Access
              </Button>
            </Link>
            <Link href="#features">
              <Button
                variant="outline"
                className="bg-transparent border-accent text-accent hover:bg-accent/10 rounded-full px-8 py-6 text-lg neon-border-purple"
              >
                Learn More
              </Button>
            </Link>
          </div>

          <div className="relative rounded-xl overflow-hidden max-w-4xl mx-auto">
            <img
              src="/beta-hero.png"
              alt="Mix & Mingle beta testers enjoying the platform"
              className="w-full object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
              <p className="text-lg font-medium">Join 500+ beta testers already exploring Mix & Mingle</p>
            </div>
          </div>
        </section>

        <section id="features" className="container py-16">
          <h2 className="text-4xl font-bold mb-10 text-center">What You'll Be Testing</h2>
          <BetaFeatures />
        </section>

        <section className="container py-16 bg-muted/10 rounded-xl">
          <h2 className="text-4xl font-bold mb-10 text-center">Beta Tester Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-background/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle>Early Access</CardTitle>
                <CardDescription>Be among the first to experience Mix & Mingle</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Get exclusive access to features before they're released to the public. Shape the future of the
                  platform with your feedback.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle>Premium Features</CardTitle>
                <CardDescription>Free access to premium features during beta</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Enjoy all premium features at no cost during the beta period. Test HD video rooms, exclusive DJ tools,
                  and more.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle>Rewards & Recognition</CardTitle>
                <CardDescription>Earn rewards for your contributions</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Active beta testers will receive exclusive rewards, including lifetime discounts, special badges, and
                  recognition in our launch materials.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="container py-16">
          <h2 className="text-4xl font-bold mb-10 text-center">What Beta Testers Are Saying</h2>
          <BetaTestimonials />
        </section>

        <section className="container py-16">
          <h2 className="text-4xl font-bold mb-10 text-center">Frequently Asked Questions</h2>
          <BetaFAQ />
        </section>

        <section className="container py-16 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Join?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            We're looking for passionate music lovers and social networkers to help us refine Mix & Mingle before our
            public launch.
          </p>
          <Link href="/beta/apply">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-lg neon-glow">
              Apply for Beta Access
            </Button>
          </Link>
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
