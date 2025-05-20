"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { badgeService, type Badge } from "@/lib/badge-service"
import { BadgeNotification } from "@/components/badge-notification"
import { increment } from "firebase/firestore"

interface Task {
  id: string
  title: string
  description: string
  points: number
  category: "profile" | "chat" | "video" | "dj" | "general"
}

export function BetaTaskList() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "profile-setup",
      title: "Complete Your Profile",
      description: "Upload a profile picture and fill out your bio with music preferences.",
      points: 5,
      category: "profile",
    },
    {
      id: "join-chat",
      title: "Join a Chat Room",
      description: "Find and join an active chat room and send at least one message.",
      points: 5,
      category: "chat",
    },
    {
      id: "create-chat",
      title: "Create a Chat Room",
      description: "Create your own chat room with a specific music theme.",
      points: 10,
      category: "chat",
    },
    {
      id: "join-video",
      title: "Join a Video Room",
      description: "Join a video room and test the audio/video quality.",
      points: 10,
      category: "video",
    },
    {
      id: "create-video",
      title: "Create a Video Room",
      description: "Create your own video room and invite at least one other beta tester.",
      points: 15,
      category: "video",
    },
    {
      id: "join-dj",
      title: "Join a DJ Room",
      description: "Join a DJ room and listen to at least 5 minutes of a set.",
      points: 10,
      category: "dj",
    },
    {
      id: "create-dj",
      title: "Create a DJ Room",
      description: "Create your own DJ room and play a short set (if you're a DJ).",
      points: 20,
      category: "dj",
    },
    {
      id: "send-gift",
      title: "Send a Virtual Gift",
      description: "Send a virtual gift to another user or DJ.",
      points: 10,
      category: "general",
    },
    {
      id: "test-mobile",
      title: "Test on Mobile Device",
      description: "Access Mix & Mingle on a mobile device and test responsiveness.",
      points: 15,
      category: "general",
    },
    {
      id: "invite-friend",
      title: "Invite a Friend",
      description: "Invite a friend to join the beta program.",
      points: 20,
      category: "general",
    },
  ])

  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [newBadge, setNewBadge] = useState<Badge | null>(null)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const loadCompletedTasks = async () => {
      if (!user) return

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))

        if (userDoc.exists()) {
          const userData = userDoc.data()
          setCompletedTasks(userData.completedBetaTasks || [])
        }
      } catch (error) {
        console.error("Error loading completed tasks:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCompletedTasks()
  }, [user])

  const toggleTask = async (taskId: string) => {
    if (!user) return

    try {
      const isCompleted = completedTasks.includes(taskId)

      if (isCompleted) {
        // For simplicity, we're not allowing unchecking tasks in this example
        return
      }

      // Get task details
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      // Update Firestore
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        completedBetaTasks: arrayUnion(taskId),
        "betaStatus.tasksCompleted": completedTasks.length + 1,
        gamificationPoints: increment(task.points),
      })

      // Update local state
      setCompletedTasks([...completedTasks, taskId])

      toast({
        title: "Task completed!",
        description: `You earned ${task.points} points for completing this task.`,
      })

      // Check for task badges
      const awardedBadges = await badgeService.checkTaskBadges(user.uid)

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
    } catch (error) {
      console.error("Error updating task status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task status. Please try again.",
      })
    }
  }

  if (loading) {
    return <div>Loading tasks...</div>
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Profile & Onboarding</h3>
        {tasks
          .filter((task) => task.category === "profile")
          .map((task) => (
            <div key={task.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/20">
              <Checkbox
                id={task.id}
                checked={completedTasks.includes(task.id)}
                onCheckedChange={() => toggleTask(task.id)}
              />
              <div className="space-y-1 flex-1">
                <label
                  htmlFor={task.id}
                  className={`font-medium cursor-pointer ${
                    completedTasks.includes(task.id) ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.title}
                </label>
                <p className="text-sm text-muted-foreground">{task.description}</p>
              </div>
              <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                {task.points} pts
              </div>
            </div>
          ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Chat Rooms</h3>
        {tasks
          .filter((task) => task.category === "chat")
          .map((task) => (
            <div key={task.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/20">
              <Checkbox
                id={task.id}
                checked={completedTasks.includes(task.id)}
                onCheckedChange={() => toggleTask(task.id)}
              />
              <div className="space-y-1 flex-1">
                <label
                  htmlFor={task.id}
                  className={`font-medium cursor-pointer ${
                    completedTasks.includes(task.id) ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.title}
                </label>
                <p className="text-sm text-muted-foreground">{task.description}</p>
              </div>
              <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                {task.points} pts
              </div>
            </div>
          ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Video Rooms</h3>
        {tasks
          .filter((task) => task.category === "video")
          .map((task) => (
            <div key={task.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/20">
              <Checkbox
                id={task.id}
                checked={completedTasks.includes(task.id)}
                onCheckedChange={() => toggleTask(task.id)}
              />
              <div className="space-y-1 flex-1">
                <label
                  htmlFor={task.id}
                  className={`font-medium cursor-pointer ${
                    completedTasks.includes(task.id) ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.title}
                </label>
                <p className="text-sm text-muted-foreground">{task.description}</p>
              </div>
              <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                {task.points} pts
              </div>
            </div>
          ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">DJ Rooms</h3>
        {tasks
          .filter((task) => task.category === "dj")
          .map((task) => (
            <div key={task.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/20">
              <Checkbox
                id={task.id}
                checked={completedTasks.includes(task.id)}
                onCheckedChange={() => toggleTask(task.id)}
              />
              <div className="space-y-1 flex-1">
                <label
                  htmlFor={task.id}
                  className={`font-medium cursor-pointer ${
                    completedTasks.includes(task.id) ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.title}
                </label>
                <p className="text-sm text-muted-foreground">{task.description}</p>
              </div>
              <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                {task.points} pts
              </div>
            </div>
          ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">General</h3>
        {tasks
          .filter((task) => task.category === "general")
          .map((task) => (
            <div key={task.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/20">
              <Checkbox
                id={task.id}
                checked={completedTasks.includes(task.id)}
                onCheckedChange={() => toggleTask(task.id)}
              />
              <div className="space-y-1 flex-1">
                <label
                  htmlFor={task.id}
                  className={`font-medium cursor-pointer ${
                    completedTasks.includes(task.id) ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.title}
                </label>
                <p className="text-sm text-muted-foreground">{task.description}</p>
              </div>
              <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                {task.points} pts
              </div>
            </div>
          ))}
      </div>

      <BadgeNotification badge={newBadge} onClose={() => setNewBadge(null)} />
    </div>
  )
}
