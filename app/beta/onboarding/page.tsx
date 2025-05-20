import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Logo } from "@/components/logo"
import { CheckCircle, Video, MessageSquare, Music } from "lucide-react"

export default function BetaOnboardingPage() {
  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <header className="container py-6">
        <div className="flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" className="neon-border rounded-full px-6">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Welcome to the Mix & Mingle Beta</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              This guide will help you get started as a beta tester and make the most of your experience.
            </p>
          </div>

          <Tabs defaultValue="getting-started" className="mb-12">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-8">
              <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
              <TabsTrigger value="chat-rooms">Chat Rooms</TabsTrigger>
              <TabsTrigger value="video-rooms">Video Rooms</TabsTrigger>
              <TabsTrigger value="dj-rooms">DJ Rooms</TabsTrigger>
              <TabsTrigger value="feedback">Providing Feedback</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="getting-started">
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>Essential first steps for beta testers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      Complete Your Profile
                    </h3>
                    <p>
                      Start by completing your profile with a photo, bio, and music preferences. This helps other beta
                      testers connect with you and enhances your testing experience.
                    </p>
                    <Link href="/dashboard/profile">
                      <Button variant="outline" size="sm">
                        Edit Profile
                      </Button>
                    </Link>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      Review Beta Tasks
                    </h3>
                    <p>
                      Check out the beta tasks in your dashboard. These tasks are designed to guide you through testing
                      all the platform's features systematically.
                    </p>
                    <Link href="/dashboard/beta">
                      <Button variant="outline" size="sm">
                        View Tasks
                      </Button>
                    </Link>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      Join the Discord Community
                    </h3>
                    <p>
                      Connect with other beta testers and the development team in our Discord community. This is where
                      we'll share updates, answer questions, and coordinate testing sessions.
                    </p>
                    <Link href="https://discord.gg/mixandmingle" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        Join Discord
                      </Button>
                    </Link>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      Check Your Notifications
                    </h3>
                    <p>
                      Make sure notifications are enabled so you don't miss important beta announcements, feedback
                      responses, and testing coordination.
                    </p>
                    <Link href="/dashboard/settings/notifications">
                      <Button variant="outline" size="sm">
                        Notification Settings
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chat-rooms">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Chat Rooms
                  </CardTitle>
                  <CardDescription>How to use and test chat room features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Joining Chat Rooms</h3>
                    <p>
                      Browse available chat rooms from the dashboard or chat rooms page. You can filter rooms by music
                      genre, popularity, or whether they're hosted by other beta testers.
                    </p>
                    <Link href="/dashboard/chat-rooms">
                      <Button variant="outline" size="sm">
                        Browse Chat Rooms
                      </Button>
                    </Link>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Creating Chat Rooms</h3>
                    <p>
                      Create your own chat room by clicking the "Create Room" button. You can set a name, description,
                      music theme, and privacy settings for your room.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Chat Features to Test</h3>
                    <ul className="space-y-2 list-disc pl-5">
                      <li>Text messaging with emoji support</li>
                      <li>@mentions and notifications</li>
                      <li>File and image sharing</li>
                      <li>Reactions to messages</li>
                      <li>Moderation tools (if you're the room creator)</li>
                      <li>Room invitations</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Reporting Issues</h3>
                    <p>
                      If you encounter any bugs or have suggestions for chat rooms, use the feedback form in your beta
                      dashboard. Be specific about what you were doing when the issue occurred.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="video-rooms">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Video Rooms
                  </CardTitle>
                  <CardDescription>How to use and test video room features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Joining Video Rooms</h3>
                    <p>
                      Browse available video rooms from the dashboard or video rooms page. Before joining, make sure
                      your camera and microphone are working properly.
                    </p>
                    <Link href="/dashboard/video-rooms">
                      <Button variant="outline" size="sm">
                        Browse Video Rooms
                      </Button>
                    </Link>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Creating Video Rooms</h3>
                    <p>
                      Create your own video room by clicking the "Create Video Room" button. You can set a name,
                      description, participant limit, and privacy settings.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Video Features to Test</h3>
                    <ul className="space-y-2 list-disc pl-5">
                      <li>Video and audio quality</li>
                      <li>Screen sharing</li>
                      <li>Background blur/effects</li>
                      <li>Chat alongside video</li>
                      <li>Muting/unmuting participants (if you're the room creator)</li>
                      <li>Connection stability with multiple participants</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Performance Testing</h3>
                    <p>
                      We're particularly interested in how video rooms perform with different numbers of participants
                      and on different devices/connection speeds. Please note any performance issues in your feedback.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dj-rooms">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    DJ Rooms
                  </CardTitle>
                  <CardDescription>How to use and test DJ room features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Joining DJ Rooms</h3>
                    <p>
                      Browse available DJ rooms from the dashboard or DJ rooms page. You can listen to live sets from
                      DJs around the world and interact with other listeners.
                    </p>
                    <Link href="/dashboard/dj-rooms">
                      <Button variant="outline" size="sm">
                        Browse DJ Rooms
                      </Button>
                    </Link>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Creating DJ Rooms (For DJs)</h3>
                    <p>
                      If you're a DJ, you can create your own room to stream your sets. You'll need to configure your
                      audio setup and streaming settings.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">DJ Room Features to Test</h3>
                    <ul className="space-y-2 list-disc pl-5">
                      <li>Audio quality and stability</li>
                      <li>Chat interaction during sets</li>
                      <li>Virtual gifts and tipping</li>
                      <li>DJ profile and set information</li>
                      <li>Room discovery and categorization</li>
                      <li>Following DJs and getting notifications</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">For DJs: Streaming Setup</h3>
                    <p>
                      If you're a DJ testing the platform, please refer to our detailed DJ streaming guide for setup
                      instructions and best practices.
                    </p>
                    <Link href="/beta/dj-guide">
                      <Button variant="outline" size="sm">
                        DJ Streaming Guide
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feedback">
              <Card>
                <CardHeader>
                  <CardTitle>Providing Feedback</CardTitle>
                  <CardDescription>How to effectively report issues and suggest improvements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Types of Feedback</h3>
                    <p>We're looking for three main types of feedback:</p>
                    <ul className="space-y-2 list-disc pl-5">
                      <li>
                        <strong>Bug Reports:</strong> When something doesn't work as expected
                      </li>
                      <li>
                        <strong>Feature Suggestions:</strong> Ideas for new features or improvements
                      </li>
                      <li>
                        <strong>General Feedback:</strong> Your overall experience and impressions
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">How to Submit Feedback</h3>
                    <p>
                      Use the feedback form in your beta dashboard. Select the appropriate feedback type and provide as
                      much detail as possible.
                    </p>
                    <Link href="/dashboard/beta?tab=feedback">
                      <Button variant="outline" size="sm">
                        Submit Feedback
                      </Button>
                    </Link>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Writing Effective Bug Reports</h3>
                    <p>When reporting bugs, please include:</p>
                    <ul className="space-y-2 list-disc pl-5">
                      <li>What you were doing when the bug occurred</li>
                      <li>What you expected to happen</li>
                      <li>What actually happened</li>
                      <li>Your device, browser, and connection type</li>
                      <li>Screenshots if possible</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Feedback Review Process</h3>
                    <p>
                      Our team reviews all feedback daily. You can track the status of your feedback in the "Feedback
                      History" tab of your beta dashboard. We may reach out for more information if needed.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faq">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>Common questions about the beta program</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">How long will the beta last?</h3>
                    <p>
                      The beta is scheduled to run for 8 weeks, but may be extended based on feedback and development
                      needs.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Will my data be preserved after the beta?</h3>
                    <p>
                      Yes, all user accounts, profiles, and connections will be preserved when we transition to the
                      public release.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">How often should I provide feedback?</h3>
                    <p>
                      We encourage you to submit feedback whenever you encounter issues or have suggestions. Quality is
                      more important than quantity, but regular feedback is very helpful.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Are there scheduled testing sessions?</h3>
                    <p>
                      Yes, we organize weekly group testing sessions for specific features. These are announced in the
                      Discord community and via email.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">What happens if I find a security issue?</h3>
                    <p>
                      Please report security issues directly to security@mixandmingle.com rather than through the
                      regular feedback form or public channels.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">How do I get help if I'm stuck?</h3>
                    <p>
                      For technical issues or questions, you can reach out in the #help channel in our Discord community
                      or email support@mixandmingle.com.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="bg-muted/10 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Beta Testing Schedule</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Week 1-2: Core Features</h3>
                  <p className="text-muted-foreground">
                    Focus on testing basic functionality, chat rooms, and user profiles.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Week 3-4: Video & DJ Rooms</h3>
                  <p className="text-muted-foreground">
                    Intensive testing of audio/video quality, streaming capabilities, and room management.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Week 5-6: Premium Features</h3>
                  <p className="text-muted-foreground">
                    Testing subscription benefits, virtual gifts, and monetization features.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h3 className="font-medium">Week 7-8: Performance & Polish</h3>
                  <p className="text-muted-foreground">
                    Final round of testing focusing on performance, stability, and user experience refinements.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Testing?</h2>
            <p className="text-muted-foreground mb-6">
              Head to your dashboard to see your beta tasks and start exploring Mix & Mingle!
            </p>
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-lg neon-glow">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-muted py-6">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2025 Mix & Mingle. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
