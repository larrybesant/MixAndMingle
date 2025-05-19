import { createDbFunctions } from "@/app/actions/db-functions"
import { createWebRTCSignalsTable } from "@/app/actions/create-webrtc-signals-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function StreamingSetupPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Streaming Setup</h1>
      <p className="mb-6">Complete the following steps to set up the DJ streaming feature:</p>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Create Database Functions</CardTitle>
            <CardDescription>Set up functions for viewer count management</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This will create the <code>increment_viewer_count</code> and <code>decrement_viewer_count</code>{" "}
              functions.
            </p>
          </CardContent>
          <CardFooter>
            <form action={createDbFunctions}>
              <Button type="submit">Create Database Functions</Button>
            </form>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Create WebRTC Signals Table</CardTitle>
            <CardDescription>Set up the table for WebRTC signaling</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This will create the <code>webrtc_signals</code> table required for peer-to-peer streaming functionality.
            </p>
          </CardContent>
          <CardFooter>
            <form action={createWebRTCSignalsTable}>
              <Button type="submit">Create WebRTC Signals Table</Button>
            </form>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Test the Streaming Feature</CardTitle>
            <CardDescription>Create a DJ profile and test streaming</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Once the setup is complete, you can test the streaming feature:</p>
            <ol className="list-decimal list-inside space-y-2 mt-4">
              <li>Create a DJ profile</li>
              <li>Create a new stream</li>
              <li>Go live and test the streaming functionality</li>
            </ol>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button asChild variant="outline">
              <Link href="/dj-profile">Create DJ Profile</Link>
            </Button>
            <Button asChild>
              <Link href="/dj/streams/create">Create Stream</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
