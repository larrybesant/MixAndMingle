"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { BugIcon, MessageSquareIcon, LightbulbIcon, CheckCircleIcon, ThumbsUpIcon, TrophyIcon } from "lucide-react"
import { BetaTaskList } from "@/components/beta-task-list"
import { UserBetaAnalytics } from "@/components/user-beta-analytics"
import { UserBadges } from "@/components/user-badges"
import { UserPointsCard } from "@/components/user-points-card"
import { BetaLeaderboard } from "@/components/beta-leaderboard"
import { BadgeLeaderboardWidget } from "@/components/badge-leaderboard-widget"
import { type Badge, badgeService } from "@/lib/badge-service"
import { BadgeNotification } from "@/components/badge-notification"
import Link from "next/link"

export default function BetaDashboardPage() {
  const [feedbackType, setFeedbackType] = useState<"bug" | "suggestion" | "general">("general")
  const [feedbackText, setFeedbackText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [betaStatus, setBetaStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newBadge, setNewBadge] = useState<Badge | null>(null)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const loadBetaStatus = async () => {
      if (!user) return

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))

        if (userDoc.exists()) {
          const userData = userDoc.data()
          setBetaStatus(
            userData.betaStatus || {
              isBetaTester: true,
              joinedAt: new Date().toISOString(),
              tasksCompleted: 0,
              feedbackSubmitted: 0,
              level: "Newcomer",
            },
          )
        }
      } catch (error) {
        console.error("Error loading beta status:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBetaStatus()
  }, [user])

  const submitFeedback = async () => {
    if (!user || !feedbackText.trim()) return

    setIsSubmitting(true)

    try {
      // Add feedback to Firestore
      await addDoc(collection(db, "betaFeedback"), {
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        userPhotoURL: user.photoURL,
        type: feedbackType,
        content: feedbackText,
        status: "pending",
        createdAt: serverTimestamp(),
        upvotes: 0,
        downvotes: 0,
      })

      // Update user's beta status
      const userRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        const currentBetaStatus = userData.betaStatus || {}

        await updateDoc(userRef, {
          betaStatus: {
            ...currentBetaStatus,
            feedbackSubmitted: (currentBetaStatus.feedbackSubmitted || 0) + 1,
          },
        })

        // Update local state
        setBetaStatus({
          ...betaStatus,
          feedbackSubmitted: (betaStatus?.feedbackSubmitted || 0) + 1,
        })

        // Check for feedback badges
        const awardedBadges = await badgeService.checkFeedbackBadges(user.uid)

        if (awardedBadges.length > 0) {
          // Get the highest rarity badge to show
          const allBadges = await badgeService.getUserBadges(user.uid)
          const newBadges = allBadges.filter((badge) => awardedBadges.includes(badge.id))

          if (newBadges.length > 0) {
            // Sort by rarity and show the rarest
            const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 }
            newBadges.sort(
              (a, b) =>
                (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) -
                (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0),
            )

            setNewBadge(newBadges[0])
          }
        }
      }

      // Reset form
      setFeedbackText("")

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback! Our team will review it shortly.",
      })
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-40">Loading beta dashboard...</div>
  }

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Beta Tester Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Help us improve Mix & Mingle by completing tasks and providing feedback.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <UserPointsCard userId={user?.uid || ""} />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tasks Completed</CardTitle>
            <CardDescription>Your progress through beta tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary mb-2">{betaStatus?.tasksCompleted || 0}</div>
            <p className="text-sm text-muted-foreground">Out of 10 total tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Feedback Submitted</CardTitle>
            <CardDescription>Your contributions to improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary mb-2">{betaStatus?.feedbackSubmitted || 0}</div>
            <p className="text-sm text-muted-foreground">Thank you for your insights!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1">
          <Card className="bg-muted/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrophyIcon className="h-5 w-5 text-primary" />
                Badge Leaderboard
              </CardTitle>
              <CardDescription>See who's collecting the most badges</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Check out our new badge leaderboard to see who's earned the most badges and view statistics about badge
                collections.
              </p>
              <Button asChild>
                <Link href="/dashboard/beta/badges/leaderboard">View Badge Leaderboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-2">
          <Card className="bg-muted/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUpIcon className="h-5 w-5 text-primary" />
                Vote on Community Feedback
              </CardTitle>
              <CardDescription>
                Help us prioritize improvements by voting on feedback from other beta testers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Your votes help our team understand which issues and features are most important to our community.
              </p>
              <Button asChild>
                <Link href="/dashboard/beta/feedback">Browse & Vote on Feedback</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="tasks" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="tasks">Beta Tasks</TabsTrigger>
          <TabsTrigger value="feedback">Submit Feedback</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Points Leaderboard</TabsTrigger>
          <TabsTrigger value="badgeLeaderboard">Badge Leaderboard</TabsTrigger>
          <TabsTrigger value="analytics">Your Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Beta Testing Tasks</CardTitle>
              <CardDescription>Complete these tasks to help us test all features</CardDescription>
            </CardHeader>
            <CardContent>
              <BetaTaskList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Submit Feedback</CardTitle>
              <CardDescription>Share your thoughts, report bugs, or suggest improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={feedbackType === "bug" ? "default" : "outline"}
                    onClick={() => setFeedbackType("bug")}
                    className="flex items-center gap-2"
                  >
                    <BugIcon className="h-4 w-4" />
                    Bug Report
                  </Button>
                  <Button
                    variant={feedbackType === "suggestion" ? "default" : "outline"}
                    onClick={() => setFeedbackType("suggestion")}
                    className="flex items-center gap-2"
                  >
                    <LightbulbIcon className="h-4 w-4" />
                    Suggestion
                  </Button>
                  <Button
                    variant={feedbackType === "general" ? "default" : "outline"}
                    onClick={() => setFeedbackType("general")}
                    className="flex items-center gap-2"
                  >
                    <MessageSquareIcon className="h-4 w-4" />
                    General Feedback
                  </Button>
                </div>

                <Textarea
                  placeholder={
                    feedbackType === "bug"
                      ? "Describe the bug, steps to reproduce, and what you expected to happen..."
                      : feedbackType === "suggestion"
                        ? "Describe your feature suggestion and how it would improve your experience..."
                        : "Share your thoughts about the platform..."
                  }
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="min-h-[150px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={submitFeedback} disabled={isSubmitting || !feedbackText.trim()}>
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="badges">
          <UserBadges userId={user?.uid || ""} />
        </TabsContent>

        <TabsContent value="leaderboard">
          <BetaLeaderboard />
        </TabsContent>

        <TabsContent value="badgeLeaderboard">
          <BadgeLeaderboardWidget />
          <div className="mt-4 flex justify-center">
            <Button asChild>
              <Link href="/dashboard/beta/badges/leaderboard">View Full Badge Leaderboard</Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <UserBetaAnalytics />
        </TabsContent>
      </Tabs>

      <Card className="bg-muted/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-primary" />
            Beta Tester Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span>3 months of Premium membership after launch</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Exclusive beta tester profile badge</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Early access to new features</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Recognition in our launch materials</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <BadgeNotification badge={newBadge} onClose={() => setNewBadge(null)} />
    </div>
  )
}
