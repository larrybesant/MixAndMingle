"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { dailyChallengeService, type Challenge } from "@/lib/daily-challenge-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { PlusIcon, PencilIcon, RefreshCwIcon } from "lucide-react"

export function ChallengeManager() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const { toast } = useToast()

  useEffect(() => {
    const loadChallenges = async () => {
      setLoading(true)
      try {
        const allChallenges = await dailyChallengeService.getAllChallengesFromPool()
        setChallenges(allChallenges)
      } catch (error) {
        console.error("Error loading challenges:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load challenges. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    loadChallenges()
  }, [toast, refreshKey])

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingChallenge) return

    try {
      const newChallengeId = await dailyChallengeService.addChallengeToPool({
        title: editingChallenge.title,
        description: editingChallenge.description,
        category: editingChallenge.category,
        icon: editingChallenge.icon,
        requirements: editingChallenge.requirements,
        reward: editingChallenge.reward,
        difficulty: editingChallenge.difficulty,
        isActive: editingChallenge.isActive,
      })

      if (newChallengeId) {
        toast({
          title: "Challenge Created",
          description: "The challenge has been added to the pool.",
        })

        setIsCreating(false)
        setEditingChallenge(null)
        setRefreshKey((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Error creating challenge:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create challenge. Please try again.",
      })
    }
  }

  const handleUpdateChallenge = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingChallenge) return

    try {
      const success = await dailyChallengeService.updateChallengeInPool(editingChallenge.id, {
        title: editingChallenge.title,
        description: editingChallenge.description,
        category: editingChallenge.category,
        icon: editingChallenge.icon,
        requirements: editingChallenge.requirements,
        reward: editingChallenge.reward,
        difficulty: editingChallenge.difficulty,
        isActive: editingChallenge.isActive,
      })

      if (success) {
        toast({
          title: "Challenge Updated",
          description: "The challenge has been updated successfully.",
        })

        setEditingChallenge(null)
        setRefreshKey((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Error updating challenge:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update challenge. Please try again.",
      })
    }
  }

  const handleEditChallenge = (challenge: Challenge) => {
    setEditingChallenge({ ...challenge })
    setIsCreating(false)
  }

  const handleCreateNew = () => {
    setEditingChallenge({
      id: "",
      title: "",
      description: "",
      category: "feedback",
      icon: "message-square",
      requirements: [{ type: "feedback", count: 1 }],
      reward: { points: 10 },
      difficulty: "easy",
      isActive: true,
    })
    setIsCreating(true)
  }

  const handleCancelEdit = () => {
    setEditingChallenge(null)
    setIsCreating(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/10 text-green-500"
      case "medium":
        return "bg-yellow-500/10 text-yellow-500"
      case "hard":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-primary/10 text-primary"
    }
  }

  const getCategoryIcon = (category: string) => {
    // This would return the appropriate icon based on category
    return category
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Challenge Manager</CardTitle>
          <CardDescription>Create and manage daily challenges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Challenge Manager</CardTitle>
            <CardDescription>Create and manage daily challenges</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefreshKey((prev) => prev + 1)}
              className="flex items-center gap-1"
            >
              <RefreshCwIcon className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={handleCreateNew} className="flex items-center gap-1">
              <PlusIcon className="h-4 w-4" />
              New Challenge
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {editingChallenge ? (
          <form onSubmit={isCreating ? handleCreateChallenge : handleUpdateChallenge}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Challenge Title</Label>
                  <Input
                    id="title"
                    value={editingChallenge.title}
                    onChange={(e) => setEditingChallenge({ ...editingChallenge, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={editingChallenge.category}
                    onValueChange={(value) =>
                      setEditingChallenge({
                        ...editingChallenge,
                        category: value as any,
                        icon: getCategoryIcon(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="exploration">Exploration</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingChallenge.description}
                  onChange={(e) => setEditingChallenge({ ...editingChallenge, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={editingChallenge.difficulty}
                    onValueChange={(value) =>
                      setEditingChallenge({
                        ...editingChallenge,
                        difficulty: value as any,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="points">Points Reward</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    value={editingChallenge.reward.points}
                    onChange={(e) =>
                      setEditingChallenge({
                        ...editingChallenge,
                        reward: { ...editingChallenge.reward, points: Number.parseInt(e.target.value) || 0 },
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="count">Required Count</Label>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    value={editingChallenge.requirements[0].count}
                    onChange={(e) =>
                      setEditingChallenge({
                        ...editingChallenge,
                        requirements: [
                          {
                            ...editingChallenge.requirements[0],
                            count: Number.parseInt(e.target.value) || 1,
                          },
                        ],
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={editingChallenge.isActive}
                  onCheckedChange={(checked) => setEditingChallenge({ ...editingChallenge, isActive: checked })}
                />
                <Label htmlFor="isActive">Active (available for daily selection)</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button type="submit">{isCreating ? "Create Challenge" : "Update Challenge"}</Button>
            </div>
          </form>
        ) : (
          <Tabs defaultValue="active">
            <TabsList className="mb-4">
              <TabsTrigger value="active">Active Challenges</TabsTrigger>
              <TabsTrigger value="inactive">Inactive Challenges</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <div className="space-y-4">
                {challenges.filter((c) => c.isActive).length > 0 ? (
                  challenges
                    .filter((c) => c.isActive)
                    .map((challenge) => (
                      <Card key={challenge.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{challenge.title}</h3>
                              <p className="text-sm text-muted-foreground">{challenge.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">{challenge.category}</Badge>
                                <Badge className={getDifficultyColor(challenge.difficulty)}>
                                  {challenge.difficulty}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{challenge.reward.points} points</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleEditChallenge(challenge)}>
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No active challenges found.</p>
                    <p className="text-sm mt-2">Create a new challenge to get started.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="inactive">
              <div className="space-y-4">
                {challenges.filter((c) => !c.isActive).length > 0 ? (
                  challenges
                    .filter((c) => !c.isActive)
                    .map((challenge) => (
                      <Card key={challenge.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{challenge.title}</h3>
                              <p className="text-sm text-muted-foreground">{challenge.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">{challenge.category}</Badge>
                                <Badge className={getDifficultyColor(challenge.difficulty)}>
                                  {challenge.difficulty}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{challenge.reward.points} points</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleEditChallenge(challenge)}>
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No inactive challenges found.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
