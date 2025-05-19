import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, KeyRound, UserPlus, Database, ShieldCheck, Mail } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>View and manage user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">View all users, confirm emails, create profiles, and manage user accounts.</p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/user-management" className="w-full">
              <Button className="w-full">Manage Users</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <KeyRound className="mr-2 h-5 w-5" />
              Password Reset
            </CardTitle>
            <CardDescription>Reset user passwords</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Reset passwords for users who are having trouble logging in.</p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/reset-password" className="w-full">
              <Button className="w-full">Reset Passwords</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="mr-2 h-5 w-5" />
              Create Account
            </CardTitle>
            <CardDescription>Create new user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Create new user accounts with confirmed emails and profiles.</p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/create-account" className="w-full">
              <Button className="w-full">Create Account</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Email Confirmation
            </CardTitle>
            <CardDescription>Manage email confirmation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Confirm emails for users or disable email confirmation requirement.</p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/fix-auth" className="w-full">
              <Button className="w-full">Manage Confirmation</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Database Management
            </CardTitle>
            <CardDescription>Manage database settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Optimize database, fix issues, and manage database settings.</p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/database" className="w-full">
              <Button className="w-full">Manage Database</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldCheck className="mr-2 h-5 w-5" />
              Beta Testing
            </CardTitle>
            <CardDescription>Manage beta testers</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">View and manage beta testers, beta codes, and beta features.</p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/beta-dashboard" className="w-full">
              <Button className="w-full">Beta Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
