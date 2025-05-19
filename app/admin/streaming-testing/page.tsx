import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Info, Zap, Gauge } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function StreamingTestingPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">DJ Live Streaming Testing Guide</h1>
      <p className="text-muted-foreground mb-8">Follow these instructions to test the DJ live streaming feature</p>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Gauge className="h-5 w-5 text-blue-500" />
              <CardTitle>New Bandwidth Adaptation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <h3 className="font-medium flex items-center text-blue-800 dark:text-blue-300">
                <Info className="h-4 w-4 mr-2" />
                Adaptive Stream Quality
              </h3>
              <p className="mt-2 text-sm">
                We've implemented automatic bandwidth adaptation that dynamically adjusts stream quality based on
                network conditions:
              </p>
              <ul className="mt-2 space-y-1 list-disc pl-5 text-sm">
                <li>Automatically switches between quality levels (720p, 480p, 360p, 240p)</li>
                <li>Monitors available bandwidth in real-time</li>
                <li>Reduces buffering and stream interruptions</li>
                <li>Provides manual quality controls for DJs</li>
                <li>Shows stream statistics for both DJs and viewers</li>
              </ul>
              <p className="mt-2 text-sm">
                This feature significantly improves streaming reliability on unstable networks and ensures the best
                possible quality for each viewer's connection.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <CardTitle>WebSocket Implementation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <h3 className="font-medium flex items-center text-blue-800 dark:text-blue-300">
                <Info className="h-4 w-4 mr-2" />
                Improved Connection Technology
              </h3>
              <p className="mt-2 text-sm">
                We've upgraded the streaming technology to use WebSockets for signaling, which provides:
              </p>
              <ul className="mt-2 space-y-1 list-disc pl-5 text-sm">
                <li>Faster connection establishment (70-80% reduction in connection time)</li>
                <li>More reliable peer-to-peer connections</li>
                <li>Better handling of network changes and reconnections</li>
                <li>Reduced server load and bandwidth usage</li>
                <li>Improved error recovery</li>
              </ul>
              <p className="mt-2 text-sm">
                This upgrade significantly improves the reliability and performance of the streaming feature, especially
                in challenging network environments.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-500" />
              <CardTitle>Important Notes Before Testing</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
              <h3 className="font-medium flex items-center text-yellow-800 dark:text-yellow-300">
                <AlertCircle className="h-4 w-4 mr-2" />
                Beta Testing Limitations
              </h3>
              <ul className="mt-2 space-y-1 list-disc pl-5 text-sm">
                <li>This feature is in beta and may have stability issues</li>
                <li>Limited to 5 concurrent viewers per stream for best performance</li>
                <li>Some network configurations may prevent successful connections</li>
                <li>Stream quality depends on the DJ's upload bandwidth</li>
                <li>Mobile support is limited and experimental</li>
              </ul>
            </div>

            <h3 className="font-medium">System Requirements</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Modern browser: Chrome 80+, Firefox 76+, Edge 80+, or Safari 13+</li>
              <li>Stable internet connection (5+ Mbps upload for DJs, 3+ Mbps download for viewers)</li>
              <li>For DJs: Webcam and microphone</li>
              <li>For viewers: Speakers or headphones</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <CardTitle>Testing Instructions for DJs</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-5 space-y-4">
              <li>
                <strong>Create a DJ Profile</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  If you haven't already, create your DJ profile with your artist name and details.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-2">
                  <Link href="/dj-profile">Go to DJ Profile</Link>
                </Button>
              </li>

              <li>
                <strong>Create a Test Stream</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a new stream and mark it as a test in the title. You can associate it with an event or make it
                  public.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-2">
                  <Link href="/dj/streams/create">Create Stream</Link>
                </Button>
              </li>

              <li>
                <strong>Go Live</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  From your stream control panel, click "Go Live" to start streaming. Allow camera and microphone access
                  when prompted.
                </p>
              </li>

              <li>
                <strong>Test Quality Settings</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Click the settings (gear) icon to access quality controls. Try different quality levels and observe
                  how they affect the stream.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  The "Auto" setting will automatically adjust quality based on your network conditions.
                </p>
              </li>

              <li>
                <strong>Monitor Stream Health</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Check the connection type, quality indicators, and bandwidth measurements. "Direct" connections are
                  better than "Relay" connections.
                </p>
              </li>

              <li>
                <strong>Interact with Viewers</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Respond to chat messages and song requests to test the interactive features.
                </p>
              </li>

              <li>
                <strong>End the Stream</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  When finished, click "End Stream" to properly close the connection.
                </p>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <CardTitle>Testing Instructions for Viewers</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-5 space-y-4">
              <li>
                <strong>Browse Available Streams</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Visit the Streams page to see all available live streams.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-2">
                  <Link href="/streams">Browse Streams</Link>
                </Button>
              </li>

              <li>
                <strong>Join a Stream</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Click on a live stream to join. The stream should start playing automatically.
                </p>
              </li>

              <li>
                <strong>Check Stream Statistics</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Click the gauge icon in the video player to see stream statistics including resolution, bandwidth, and
                  connection quality.
                </p>
              </li>

              <li>
                <strong>Test on Different Networks</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  If possible, try viewing the stream on different network conditions (switch between WiFi and mobile
                  data, or test with bandwidth limitations).
                </p>
              </li>

              <li>
                <strong>Interact with the DJ</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Send chat messages and song requests to test the interactive features.
                </p>
              </li>

              <li>
                <strong>Test on Different Devices</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  If possible, try viewing the stream on different devices and browsers.
                </p>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reporting Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              If you encounter any issues during testing, please report them with the following details:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your browser and version</li>
              <li>Your device type (desktop, mobile, tablet)</li>
              <li>Your connection type (WiFi, Ethernet, Cellular)</li>
              <li>A description of the issue</li>
              <li>Any error messages you saw</li>
              <li>Steps to reproduce the issue</li>
              <li>Stream quality settings at the time of the issue</li>
              <li>Bandwidth measurements if available</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
