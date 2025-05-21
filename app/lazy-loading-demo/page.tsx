"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { preloadOnHover } from "@/utils/preload-component"
import {
  LazyVideoRoom,
  LazyEnhancedChatRoom,
  LazyVirtualGifts,
  LazySubscriptionPlans,
  LazyProfileEditor,
  LazyRoadmapTimeline,
  LazyBetaEngagementChart,
  LazyFeedbackAnalytics,
} from "@/components/lazy"

export default function LazyLoadingDemo() {
  const [showVideoRoom, setShowVideoRoom] = useState(false)
  const [showChatRoom, setShowChatRoom] = useState(false)
  const [showVirtualGifts, setShowVirtualGifts] = useState(false)
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false)

  // Preload functions
  const videoRoomPreload = preloadOnHover(() => import("@/components/video-room"), "video-room")
  const chatRoomPreload = preloadOnHover(() => import("@/components/enhanced-chat-room"), "chat-room")
  const giftsPreload = preloadOnHover(() => import("@/components/virtual-gifts"), "virtual-gifts")
  const subscriptionPreload = preloadOnHover(() => import("@/components/subscription-plans"), "subscription-plans")

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Lazy Loading Demo</h1>
      <p className="text-muted-foreground mb-8">
        This page demonstrates lazy loading of heavy UI components. Components are only loaded when needed.
      </p>

      <Tabs defaultValue="components" className="mb-8">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Room</CardTitle>
                <CardDescription>A heavy component with WebRTC video streaming capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowVideoRoom(!showVideoRoom)} {...videoRoomPreload}>
                  {showVideoRoom ? "Hide" : "Show"} Video Room
                </Button>

                {showVideoRoom && (
                  <div className="mt-4">
                    <LazyVideoRoom roomId="demo-room" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chat Room</CardTitle>
                <CardDescription>A complex chat interface with real-time messaging</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowChatRoom(!showChatRoom)} {...chatRoomPreload}>
                  {showChatRoom ? "Hide" : "Show"} Chat Room
                </Button>

                {showChatRoom && (
                  <div className="mt-4">
                    <LazyEnhancedChatRoom roomId="demo-chat" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Virtual Gifts</CardTitle>
                <CardDescription>A component with animations and interactive elements</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowVirtualGifts(!showVirtualGifts)} {...giftsPreload}>
                  {showVirtualGifts ? "Hide" : "Show"} Virtual Gifts
                </Button>

                {showVirtualGifts && (
                  <div className="mt-4">
                    <LazyVirtualGifts />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription>A component with payment integration and pricing tables</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowSubscriptionPlans(!showSubscriptionPlans)} {...subscriptionPreload}>
                  {showSubscriptionPlans ? "Hide" : "Show"} Subscription Plans
                </Button>

                {showSubscriptionPlans && (
                  <div className="mt-4">
                    <LazySubscriptionPlans />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Components</CardTitle>
              <CardDescription>Heavy components with charts and data visualization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <LazyBetaEngagementChart />
              <LazyFeedbackAnalytics />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Editor</CardTitle>
              <CardDescription>A complex form with image uploads and validation</CardDescription>
            </CardHeader>
            <CardContent>
              <LazyProfileEditor />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Roadmap Timeline</CardTitle>
          <CardDescription>A complex component with interactive timeline visualization</CardDescription>
        </CardHeader>
        <CardContent>
          <LazyRoadmapTimeline roadmapItems={[]} />
        </CardContent>
      </Card>
    </div>
  )
}
