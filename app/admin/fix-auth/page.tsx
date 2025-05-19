"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { confirmAllUsers, ensureUserProfiles, createUserWithProfile } from "@/app/actions/auth-helpers"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function FixAuthPage() {
  const [isConfirmingUsers, setIsConfirmingUsers] = useState(false)
  const [isCreatingProfiles, setIsCreatingProfiles] = useState(false)
  const [isCreatingTestUser, setIsCreatingTestUser] = useState(false)
  const [confirmResult, setConfirmResult] = useState<any>(null)
  const [profilesResult, setProfilesResult] = useState<any>(null)
  const [testUserResult, setTestUserResult] = useState<any>(null)
  const [testEmail, setTestEmail] = useState("test@example.com")
  const [testPassword, setTestPassword] = useState("Password123!")
  const [testFirstName, setTestFirstName] = useState("Test")
  const [testLastName, setTestLastName] = useState("User")

  const handleConfirmUsers = async () => {
    setIsConfirmingUsers(true)
    setConfirmResult(null)

    try {
      const result = await confirmAllUsers()
      setConfirmResult(result)
    } catch (error: any) {
      setConfirmResult({ success: false, error: error.message })
    } finally {
      setIsConfirmingUsers(false)
    }
  }

  const handleEnsureProfiles = async () => {
    setIsCreatingProfiles(true)
    setProfilesResult(null)

    try {
      const result = await ensureUserProfiles()
      setProfilesResult(result)
    } catch (error: any) {
      setProfilesResult({ success: false, error: error.message })
    } finally {
      setIsCreatingProfiles(false)
    }
  }

  const handleCreateTestUser = async () => {
    setIsCreatingTestUser(true)
    setTestUserResult(null)

    try {
      const result = await createUserWithProfile(testEmail, testPassword, testFirstName, testLastName)
      setTestUserResult(result)
    } catch (error: any) {
      setTestUserResult({ success: false, error: error.message })
    } finally {
      setIsCreatingTestUser(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-6">Fix Authentication Issues</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Confirm All Users</CardTitle>
            <CardDescription>
              Automatically confirm email addresses for all users who haven't confirmed their email yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {confirmResult && (
              <Alert variant={confirmResult.success ? "default" : "destructive"} className="mb-4">
                {confirmResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{confirmResult.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>
                  {confirmResult.success ? `Confirmed ${confirmResult.confirmedCount} users.` : confirmResult.error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleConfirmUsers} disabled={isConfirmingUsers}>
              {isConfirmingUsers ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming Users...
                </>
              ) : (
                "Confirm All Users"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Missing Profiles</CardTitle>
            <CardDescription>
              Create profiles for users who don't have one. This fixes issues where users can't log in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profilesResult && (
              <Alert variant={profilesResult.success ? "default" : "destructive"} className="mb-4">
                {profilesResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{profilesResult.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>
                  {profilesResult.success ? `Created ${profilesResult.createdCount} profiles.` : profilesResult.error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleEnsureProfiles} disabled={isCreatingProfiles}>
              {isCreatingProfiles ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Profiles...
                </>
              ) : (
                "Create Missing Profiles"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Create Test User</CardTitle>
          <CardDescription>Create a new test user with a confirmed email and profile for testing.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="Password123!"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={testFirstName}
                onChange={(e) => setTestFirstName(e.target.value)}
                placeholder="Test"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={testLastName}
                onChange={(e) => setTestLastName(e.target.value)}
                placeholder="User"
              />
            </div>
          </div>

          {testUserResult && (
            <Alert variant={testUserResult.success ? "default" : "destructive"} className="mt-4">
              {testUserResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{testUserResult.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>
                {testUserResult.success ? `Created test user with email ${testEmail}.` : testUserResult.error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreateTestUser} disabled={isCreatingTestUser}>
            {isCreatingTestUser ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating User...
              </>
            ) : (
              "Create Test User"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
