import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import RouteChecker from "@/components/route-checker"

export default function TestRoutesPage() {
  // Define the routes we want to test
  const routes = [
    { path: "/", name: "Home" },
    { path: "/signup", name: "Signup" },
    { path: "/signin", name: "Signin" },
    { path: "/beta-guide", name: "Beta Guide" },
    { path: "/streams", name: "Streams" },
    { path: "/feedback", name: "Feedback" },
  ]

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Route Testing</h1>
      <p className="mb-8 text-gray-400">Click the links below to test if the routes are working correctly.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <Card key={route.path} className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>{route.name}</CardTitle>
              <CardDescription>{route.path}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">Test if this route is working correctly.</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={route.path}>Test Route</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-10 p-4 border border-blue-500/30 rounded-lg bg-blue-950/20">
        <h2 className="text-xl font-bold mb-2">Current Route Status</h2>
        <p className="text-gray-400 mb-4">The current route is being checked for availability.</p>
        <RouteChecker />
      </div>
    </div>
  )
}
