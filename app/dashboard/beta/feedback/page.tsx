"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeedbackList } from "@/components/feedback-list"
import { TopVotedFeedback } from "@/components/top-voted-feedback"
import { Button } from "@/components/ui/button"
import { BarChart3 } from "lucide-react"
import Link from "next/link"

export default function BetaFeedbackPage() {
  const [activeTab, setActiveTab] = useState("all")
  const { user } = useAuth()

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h1 className="text-3xl font-bold">Beta Feedback</h1>
        <Link href="/dashboard/beta/feedback/analytics">
          <Button variant="outline" className="mt-2 md:mt-0">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Feedback Analytics
          </Button>
        </Link>
      </div>
      <p className="text-muted-foreground mb-8">
        Browse, vote, and discuss feedback from the Mix & Mingle beta community.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Community Feedback</CardTitle>
              <CardDescription>Vote on feedback to help us prioritize improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Feedback</TabsTrigger>
                  <TabsTrigger value="top">Top Voted</TabsTrigger>
                  <TabsTrigger value="bugs">Bugs</TabsTrigger>
                  <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <FeedbackList />
                </TabsContent>

                <TabsContent value="top">
                  <FeedbackList showFilters={false} />
                </TabsContent>

                <TabsContent value="bugs">
                  <FeedbackList showFilters={false} />
                </TabsContent>

                <TabsContent value="suggestions">
                  <FeedbackList showFilters={false} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1">
          <TopVotedFeedback limit={5} />
        </div>
      </div>
    </div>
  )
}
