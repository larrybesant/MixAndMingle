import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { CheckCircle } from "lucide-react"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <header className="container py-6">
        <div className="flex justify-between items-center">
          <Logo />
          <Link href="/">
            <Button variant="outline" className="neon-border rounded-full px-6">
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container py-20 flex flex-col items-center justify-center text-center">
        <CheckCircle className="h-20 w-20 text-primary mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Application Received!</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-8">
          Thank you for applying to join the Mix & Mingle beta program. We've received your application and will review
          it shortly.
        </p>
        <div className="bg-muted/20 rounded-xl p-6 max-w-2xl mb-10">
          <h2 className="text-2xl font-bold mb-4">What happens next?</h2>
          <ul className="text-left space-y-4">
            <li className="flex items-start gap-3">
              <span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </span>
              <span>
                Our team will review your application within <strong>48 hours</strong>.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </span>
              <span>
                You'll receive an email with your <strong>beta access code</strong> if selected.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </span>
              <span>
                Follow the instructions in the email to <strong>set up your account</strong> and join the beta.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                4
              </span>
              <span>
                You'll be invited to our <strong>beta tester Discord community</strong> for updates and discussions.
              </span>
            </li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-lg neon-glow">
              Return to Homepage
            </Button>
          </Link>
          <Link href="https://discord.gg/mixandmingle" target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              className="bg-transparent border-accent text-accent hover:bg-accent/10 rounded-full px-8 py-6 text-lg neon-border-purple"
            >
              Join Discord Community
            </Button>
          </Link>
        </div>
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
