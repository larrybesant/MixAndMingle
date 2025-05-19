import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function EmailConfirmationHelpPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Email Confirmation Help</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Having Trouble Confirming Your Email?</CardTitle>
          <CardDescription>We're here to help you get access to your beta account</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            During our beta testing phase, some users may experience issues with email confirmation. Here are some steps
            you can take to resolve common issues:
          </p>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>I didn't receive a confirmation email</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Check your spam or junk folder</li>
                  <li>Add support@mixandmingle.com to your contacts</li>
                  <li>Try signing in - your account might already be confirmed</li>
                  <li>Wait a few minutes - email delivery can sometimes be delayed</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>The confirmation link doesn't work</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Make sure you're clicking the most recent confirmation email</li>
                  <li>Try copying and pasting the link directly into your browser</li>
                  <li>Clear your browser cache and cookies, then try again</li>
                  <li>Try using a different browser</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>I confirmed my email but still can't log in</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Make sure you're using the correct email address and password</li>
                  <li>Try resetting your password</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Disable any ad blockers or privacy extensions that might interfere with authentication</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-4">
          <p className="text-sm">
            If you're still having trouble, please contact our support team and we'll manually verify your account.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="mailto:support@mixandmingle.com?subject=Beta%20Email%20Confirmation%20Issue">
                Contact Support
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signin">Try Signing In</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>

      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">For Beta Administrators</h2>
        <p className="mb-4">If you're a beta administrator, you can manually verify users through the admin panel:</p>
        <Button asChild>
          <Link href="/admin/verify-users">Go to Admin Verification Panel</Link>
        </Button>
      </div>
    </div>
  )
}
