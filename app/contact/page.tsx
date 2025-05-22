import type { Metadata } from "next"
import Link from "next/link"
import { LegalDocumentLayout } from "@/components/legal-document-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MapPin, Phone, Clock, MessageSquare } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us | Mix & Mingle",
  description: "Contact information and support for Mix & Mingle application",
}

export default function ContactPage() {
  return (
    <LegalDocumentLayout title="Contact Us">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
          <p className="mb-6">
            Have questions, feedback, or need assistance? We're here to help! Reach out to our team using any of the
            methods below.
          </p>

          <div className="space-y-6">
            <div className="flex items-start">
              <Mail className="h-5 w-5 mr-3 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-sm text-muted-foreground mb-1">For general inquiries:</p>
                <p>
                  <a href="mailto:info@mixandmingle.com" className="text-primary hover:underline">
                    info@mixandmingle.com
                  </a>
                </p>

                <p className="text-sm text-muted-foreground mt-2 mb-1">For support:</p>
                <p>
                  <a href="mailto:support@mixandmingle.com" className="text-primary hover:underline">
                    support@mixandmingle.com
                  </a>
                </p>

                <p className="text-sm text-muted-foreground mt-2 mb-1">For legal notices:</p>
                <p>
                  <a href="mailto:legal@mixandmingle.com" className="text-primary hover:underline">
                    legal@mixandmingle.com
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Phone className="h-5 w-5 mr-3 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Phone</h3>
                <p className="text-sm text-muted-foreground mb-1">Customer Support:</p>
                <p>
                  <a href="tel:+18005551234" className="text-primary hover:underline">
                    +1 (800) 555-1234
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="h-5 w-5 mr-3 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Address</h3>
                <p className="text-sm">
                  Mix & Mingle, Inc.
                  <br />
                  123 Music Avenue
                  <br />
                  Suite 456
                  <br />
                  San Francisco, CA 94107
                  <br />
                  United States
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="h-5 w-5 mr-3 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Hours of Operation</h3>
                <p className="text-sm">
                  Monday - Friday: 9:00 AM - 6:00 PM (PST)
                  <br />
                  Saturday: 10:00 AM - 4:00 PM (PST)
                  <br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Legal Information</h2>
            <p className="mb-4">
              For legal notices, please contact our legal department at{" "}
              <a href="mailto:legal@mixandmingle.com" className="text-primary hover:underline">
                legal@mixandmingle.com
              </a>{" "}
              or send correspondence to our mailing address.
            </p>

            <h3 className="text-lg font-medium mb-2">Dispute Resolution</h3>
            <p className="mb-4">
              If you have a dispute with Mix & Mingle, please contact us first and try to resolve the dispute
              informally. If we cannot resolve the dispute informally, you agree to resolve any claims through binding
              arbitration in accordance with our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-6">
                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                <h2 className="text-xl font-bold">Send Us a Message</h2>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input id="email" type="email" placeholder="Your email" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input id="subject" placeholder="Subject of your message" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea id="message" placeholder="Your message" rows={5} />
                </div>

                <Button type="submit" className="w-full">
                  Send Message
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By submitting this form, you agree to our{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>{" "}
                  and consent to us collecting and processing your data.
                </p>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">How do I reset my password?</h4>
                <p className="text-sm text-muted-foreground">
                  You can reset your password by clicking on the "Forgot Password" link on the login page.
                </p>
              </div>
              <div>
                <h4 className="font-medium">How do I delete my account?</h4>
                <p className="text-sm text-muted-foreground">
                  To delete your account, go to your account settings and select the "Delete Account" option.
                </p>
              </div>
              <div>
                <h4 className="font-medium">How do I report inappropriate content?</h4>
                <p className="text-sm text-muted-foreground">
                  You can report inappropriate content by clicking the "Report" button next to the content or by
                  contacting our support team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LegalDocumentLayout>
  )
}
