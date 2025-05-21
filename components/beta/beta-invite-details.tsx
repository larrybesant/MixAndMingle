"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Logo } from "@/components/logo"

interface BetaInviteDetailsProps {
  code: string
  details: any
}

export function BetaInviteDetails({ code, details }: BetaInviteDetailsProps) {
  const router = useRouter()
  const [accepting, setAccepting] = useState(false)

  const handleAcceptInvite = () => {
    setAccepting(true)
    // Store the code in session storage for the registration page
    sessionStorage.setItem("betaInviteCode", code)
    router.push("/beta/register")
  }

  if (details.isExpired) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Logo />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Invitation Expired</CardTitle>
            <CardDescription>This beta invitation has expired.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Expired Invitation</AlertTitle>
              <AlertDescription>
                The invitation code {code} has expired. Please request a new invitation.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Link href="/beta" className="w-full">
              <Button variant="outline" className="w-full">
                Learn More About Our Beta
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (details.used) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Logo />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Invitation Already Used</CardTitle>
            <CardDescription>This beta invitation has already been claimed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Already Claimed</AlertTitle>
              <AlertDescription>
                The invitation code {code} has already been used. Each code can only be used once.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <div className="grid grid-cols-2 gap-4 w-full">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/beta">
                <Button variant="outline" className="w-full">
                  Learn More
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <Logo />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>You're Invited!</CardTitle>
          <CardDescription>You've been invited to join the Mix & Mingle beta program.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Valid Invitation</AlertTitle>
            <AlertDescription>
              Your invitation code <strong>{code}</strong> is valid and ready to use.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Access Level</h3>
              <p className="text-sm text-muted-foreground capitalize">{details.accessLevel}</p>
            </div>

            <div>
              <h3 className="font-medium">Expires</h3>
              <p className="text-sm text-muted-foreground">{details.expiresAt?.toDate().toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="grid grid-cols-1 gap-4 w-full">
            <Button onClick={handleAcceptInvite} disabled={accepting} className="w-full">
              {accepting ? "Accepting..." : "Accept Invitation"}
            </Button>
            <Link href="/beta">
              <Button variant="outline" className="w-full">
                Learn More About the Beta
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
