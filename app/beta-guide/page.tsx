import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  AlertCircle,
  CheckCircle2,
  Gauge,
  Globe,
  HelpCircle,
  Info,
  Laptop,
  MessageSquare,
  Radio,
  Smartphone,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BetaGuidePage() {
  return (
    <div className="container py-10 max-w-4xl">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-4xl font-bold">Beta Tester Guide</h1>
        <p className="text-xl text-gray-400">Welcome to the MIX & MINGLE Beta Test</p>
      </div>

      <div className="p-4 mb-8 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-500">Beta Version Information</h3>
            <p className="text-sm mt-1 text-gray-300">
              You're testing version <span className="font-mono bg-blue-950/50 px-1 rounded">0.9.0-beta</span>. This is
              a pre-release version and may contain bugs or incomplete features. Your feedback is essential to help us
              improve the platform before public release.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="getting-started" className="mb-8">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="features">Key Features</TabsTrigger>
          <TabsTrigger value="feedback">Providing Feedback</TabsTrigger>
        </TabsList>
        <TabsContent value="getting-started" className="space-y-4">
          <h2 className="text-2xl font-bold">Getting Started</h2>
          <p>Follow these steps to begin testing the MIX & MINGLE platform:</p>

          <div className="space-y-4 mt-6">
            <div className="flex items-start">
              <div className="bg-orange-500/20 p-2 rounded-full mr-4 flex-shrink-0">
                <span className="text-orange-500 font-bold">1</span>
              </div>
              <div>
                <h3 className="text-lg font-medium">Create Your Account</h3>
                <p className="text-gray-400 mt-1">
                  Sign up using your email address. Verify your email to activate all features.
                </p>
                <Button asChild className="mt-2 bg-orange-500 hover:bg-orange-600 rounded-full">
                  <Link href="/signup">Create Account</Link>
                </Button>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-blue-500/20 p-2 rounded-full mr-4 flex-shrink-0">
                <span className="text-blue-500 font-bold">2</span>
              </div>
              <div>
                <h3 className="text-lg font-medium">Complete Your Profile</h3>
                <p className="text-gray-400 mt-1">
                  Add your details, preferences, and a profile picture to enhance your experience.
                </p>
                <Button asChild variant="outline" className="mt-2 border-blue-500/50 text-blue-500 rounded-full">
                  <Link href="/profile">Edit Profile</Link>
                </Button>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-purple-500/20 p-2 rounded-full mr-4 flex-shrink-0">
                <span className="text-purple-500 font-bold">3</span>
              </div>
              <div>
                <h3 className="text-lg font-medium">Explore Live Streams</h3>
                <p className="text-gray-400 mt-1">
                  Browse available DJ streams, join a stream, and interact with other listeners.
                </p>
                <Button asChild className="mt-2 bg-purple-500 hover:bg-purple-600 rounded-full">
                  <Link href="/streams">Browse Streams</Link>
                </Button>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-green-500/20 p-2 rounded-full mr-4 flex-shrink-0">
                <span className="text-green-500 font-bold">4</span>
              </div>
              <div>
                <h3 className="text-lg font-medium">Create a DJ Profile (Optional)</h3>
                <p className="text-gray-400 mt-1">
                  If you're a DJ, create your profile and try hosting your own live stream.
                </p>
                <Button asChild variant="outline" className="mt-2 border-green-500/50 text-green-500 rounded-full">
                  <Link href="/dj-profile">Create DJ Profile</Link>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <h2 className="text-2xl font-bold">Key Features to Test</h2>
          <p>Please focus on testing these core features and providing detailed feedback:</p>

          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Radio className="h-5 w-5 text-orange-500" />
                  <CardTitle>Live DJ Streaming</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Test stream quality and stability</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Try different network conditions (WiFi, mobile data)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Test automatic quality adaptation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <CardTitle>Chat & Interaction</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Send and receive chat messages during streams</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Request songs from DJs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Test emoji reactions and other interactive features</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <CardTitle>DJ Broadcasting</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Create and schedule streams</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Test broadcasting with different audio/video sources</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Manage song requests and chat with listeners</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-green-500" />
                  <CardTitle>Social Features</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Create and manage events</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Connect with friends and other users</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Test notification system for events and streams</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <h2 className="text-2xl font-bold">Providing Feedback</h2>
          <p>Your feedback is crucial to improving MIX & MINGLE. Here's how to report issues and suggestions:</p>

          <div className="space-y-6 mt-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                Reporting Bugs
              </h3>
              <p className="text-gray-400 mt-2">
                When you encounter a bug or technical issue, please provide the following details:
              </p>
              <ul className="mt-3 space-y-2 text-gray-400">
                <li className="flex items-start">
                  <span className="bg-red-500/20 text-red-500 text-xs px-1.5 py-0.5 rounded mr-2 mt-0.5">1</span>
                  <span>Detailed description of what happened</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-red-500/20 text-red-500 text-xs px-1.5 py-0.5 rounded mr-2 mt-0.5">2</span>
                  <span>Steps to reproduce the issue</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-red-500/20 text-red-500 text-xs px-1.5 py-0.5 rounded mr-2 mt-0.5">3</span>
                  <span>Your device, browser, and operating system</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-red-500/20 text-red-500 text-xs px-1.5 py-0.5 rounded mr-2 mt-0.5">4</span>
                  <span>Screenshots or screen recordings (if possible)</span>
                </li>
              </ul>
              <Button asChild className="mt-4 bg-red-500 hover:bg-red-600 rounded-full">
                <Link href="/feedback?type=bug">Report a Bug</Link>
              </Button>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium flex items-center">
                <HelpCircle className="h-5 w-5 text-blue-500 mr-2" />
                Feature Suggestions
              </h3>
              <p className="text-gray-400 mt-2">
                Have ideas for new features or improvements? We'd love to hear them! Please include:
              </p>
              <ul className="mt-3 space-y-2 text-gray-400">
                <li className="flex items-start">
                  <span className="bg-blue-500/20 text-blue-500 text-xs px-1.5 py-0.5 rounded mr-2 mt-0.5">1</span>
                  <span>Clear description of the feature</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500/20 text-blue-500 text-xs px-1.5 py-0.5 rounded mr-2 mt-0.5">2</span>
                  <span>How it would benefit users</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500/20 text-blue-500 text-xs px-1.5 py-0.5 rounded mr-2 mt-0.5">3</span>
                  <span>Any reference examples from other platforms</span>
                </li>
              </ul>
              <Button asChild variant="outline" className="mt-4 border-blue-500/50 text-blue-500 rounded-full">
                <Link href="/feedback?type=feature">Suggest a Feature</Link>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <h2 className="text-2xl font-bold mb-4">System Requirements & Compatibility</h2>
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Laptop className="h-5 w-5 text-orange-500" />
              <CardTitle>Desktop</CardTitle>
            </div>
            <CardDescription>Recommended browsers</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Chrome 80+</span>
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Firefox 76+</span>
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Edge 80+</span>
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Safari 13+</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-blue-500" />
              <CardTitle>Mobile</CardTitle>
            </div>
            <CardDescription>Supported devices</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span>iOS 13+ (Safari)</span>
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Android 8+ (Chrome)</span>
              </li>
              <li className="flex items-start">
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Some features may be limited on mobile browsers</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Gauge className="h-5 w-5 text-purple-500" />
              <CardTitle>Network</CardTitle>
            </div>
            <CardDescription>Connection requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Viewing: 3+ Mbps download</span>
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Broadcasting: 5+ Mbps upload</span>
              </li>
              <li className="flex items-start">
                <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Adaptive streaming adjusts to your connection</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Known Limitations</h2>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-8">
        <p className="text-gray-400 mb-3">During the beta phase, please be aware of the following limitations:</p>
        <ul className="space-y-2 text-gray-400">
          <li className="flex items-start">
            <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
            <span>Maximum of 5 concurrent viewers per stream for optimal performance</span>
          </li>
          <li className="flex items-start">
            <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
            <span>Stream duration limited to 30 minutes during beta</span>
          </li>
          <li className="flex items-start">
            <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
            <span>Some corporate or school networks may block WebRTC connections</span>
          </li>
          <li className="flex items-start">
            <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
            <span>Mobile broadcasting is experimental and may have stability issues</span>
          </li>
          <li className="flex items-start">
            <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
            <span>Stream recording functionality is not available in the beta</span>
          </li>
        </ul>
      </div>

      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Ready to Start Testing?</h2>
        <p className="text-gray-300 mb-4">
          Thank you for participating in our beta test. Your feedback will help shape the future of MIX & MINGLE!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 rounded-full">
            <Link href="/streams">Browse Streams</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-purple-500/50 text-purple-500 rounded-full">
            <Link href="/feedback">Provide Feedback</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
