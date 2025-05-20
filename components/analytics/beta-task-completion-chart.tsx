"use client"

import { useState, useEffect } from "react"

interface TaskData {
  id: string
  title: string
  completionRate: number
  category: string
}

// Simple horizontal bar chart
function HorizontalBarChart({ data }: { data: TaskData[] }) {
  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.id} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{item.title}</span>
            <span className="font-medium">{item.completionRate}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${item.completionRate}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function BetaTaskCompletionChart() {
  const [isLoading, setIsLoading] = useState(true)
  const [taskData, setTaskData] = useState<TaskData[]>([])
  const [filteredData, setFilteredData] = useState<TaskData[]>([])
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    const fetchTaskData = async () => {
      setIsLoading(true)

      try {
        // In a real implementation, you would fetch this data from Firestore
        // For this example, we'll use sample data

        const sampleData: TaskData[] = [
          { id: "profile-setup", title: "Complete Your Profile", completionRate: 87, category: "profile" },
          { id: "join-chat", title: "Join a Chat Room", completionRate: 76, category: "chat" },
          { id: "create-chat", title: "Create a Chat Room", completionRate: 52, category: "chat" },
          { id: "join-video", title: "Join a Video Room", completionRate: 68, category: "video" },
          { id: "create-video", title: "Create a Video Room", completionRate: 41, category: "video" },
          { id: "join-dj", title: "Join a DJ Room", completionRate: 63, category: "dj" },
          { id: "create-dj", title: "Create a DJ Room", completionRate: 29, category: "dj" },
          { id: "send-gift", title: "Send a Virtual Gift", completionRate: 45, category: "general" },
          { id: "test-mobile", title: "Test on Mobile Device", completionRate: 58, category: "general" },
          { id: "invite-friend", title: "Invite a Friend", completionRate: 33, category: "general" },
        ]

        setTaskData(sampleData)
        setFilteredData(sampleData)
      } catch (error) {
        console.error("Error fetching task data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTaskData()
  }, [])

  useEffect(() => {
    if (filter === "all") {
      setFilteredData(taskData)
    } else {
      setFilteredData(taskData.filter((task) => task.category === filter))
    }
  }, [filter, taskData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 text-sm rounded-full ${
            filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          All Tasks
        </button>
        <button
          onClick={() => setFilter("profile")}
          className={`px-3 py-1 text-sm rounded-full ${
            filter === "profile" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setFilter("chat")}
          className={`px-3 py-1 text-sm rounded-full ${
            filter === "chat" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setFilter("video")}
          className={`px-3 py-1 text-sm rounded-full ${
            filter === "video" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          Video
        </button>
        <button
          onClick={() => setFilter("dj")}
          className={`px-3 py-1 text-sm rounded-full ${
            filter === "dj" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          DJ
        </button>
        <button
          onClick={() => setFilter("general")}
          className={`px-3 py-1 text-sm rounded-full ${
            filter === "general" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          General
        </button>
      </div>

      <HorizontalBarChart data={filteredData} />

      <div className="mt-6 text-sm text-muted-foreground">
        <p>
          {filter === "all"
            ? "Overall, profile setup and joining rooms have the highest completion rates."
            : filter === "profile"
              ? "Profile setup has a high completion rate, indicating a smooth onboarding process."
              : filter === "chat"
                ? "More users join chat rooms than create them, suggesting a potential barrier to room creation."
                : filter === "video"
                  ? "Video room creation has a lower completion rate, possibly due to technical requirements."
                  : filter === "dj"
                    ? "DJ room creation has the lowest completion rate, likely due to its specialized nature."
                    : "Inviting friends has a lower completion rate than other general tasks."}
        </p>
      </div>
    </div>
  )
}
