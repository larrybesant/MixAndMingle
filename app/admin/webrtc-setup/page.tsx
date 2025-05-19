import { createWebRTCSignalsTable } from "@/app/actions/create-webrtc-signals-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function WebRTCSetupPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">WebRTC Setup</h1>

      <Card>
        <CardHeader>
          <CardTitle>WebRTC Signals Table</CardTitle>
          <CardDescription>Create the necessary table for WebRTC signaling</CardDescription>
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
    </div>
  )
}
