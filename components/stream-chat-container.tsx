"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, RefreshCw, MessageSquare, Users, Settings } from "lucide-react"
import { StreamChat } from "@/components/stream-chat"
import { StreamChatModeration } from "@/components/stream-chat-moderation"
import { getStreamViewers } from "@/services/stream-service"

interface StreamChatContainerProps {
  streamId: string
  isDj: boolean
}

export function StreamChatContainer({ streamId, isDj }: StreamChatContainerProps) {
  const [viewers, setViewers] = useState<any[]>([])
  const [viewerCount, setViewerCount] = useState(0)
  const [activeTab, setActiveTab] = useState("chat")
  const [loadingViewers, setLoadingViewers] = useState(false)
  const [viewersError, setViewersError] = useState<string | null>(null)

  // Fetch viewers
  const fetchViewers = async () => {
    try {
      setLoadingViewers(true)
      setViewersError(null)
      const viewerData = await getStreamViewers(streamId)
      setViewers(viewerData)
      setViewerCount(viewerData.length)
    } catch (error) {
      console.error("Error fetching viewers:", error)
      setViewersError("Failed to load viewers. Please try again.")
    } finally {
      setLoadingViewers(false)
    }
  }

  // Fetch viewers periodically
  useEffect(() => {
    fetchViewers()
    const interval = setInterval(fetchViewers, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [streamId])

  return (
    <Card className="h-full">
      <Tabs defaultValue="chat" className="h-full flex flex-col" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="relative">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Chat</span>
            </span>
            {activeTab !== "chat" && viewerCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {viewerCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="viewers" className="relative">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Viewers</span>
            </span>
            {viewerCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {viewerCount}
              </Badge>
            )}
          </TabsTrigger>
          {isDj && (
            <TabsTrigger value="moderation">
              <span className="flex items-center gap-1">
                <Settings className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Moderation</span>
              </span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="chat" className="flex-1 overflow-hidden">
          <StreamChat streamId={streamId} isDj={isDj} />
        </TabsContent>

        <TabsContent value="viewers" className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto p-4">
            {loadingViewers ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : viewersError ? (
              <div className="flex flex-col justify-center items-center h-full gap-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{viewersError}</AlertDescription>
                </Alert>
                <Button variant="outline" onClick={fetchViewers} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            ) : viewers.length === 0 ? (
              <div className="flex justify-center items-center h-full text-muted-foreground">
                <p>No viewers currently watching</p>
              </div>
            ) : (
              <div className="space-y-4">
                {viewers.map((viewer) => (
                  <div key={viewer.id} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={viewer.profiles?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {viewer.profiles?.first_name?.charAt(0) || viewer.profiles?.username?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {viewer.profiles?.first_name
                          ? `${viewer.profiles.first_name} ${viewer.profiles.last_name || ""}`
                          : viewer.profiles?.username || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(viewer.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {isDj && (
          <TabsContent value="moderation" className="flex-1 overflow-auto">
            <div className="p-4">
              <StreamChatModeration streamId={streamId} />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </Card>
  )
}
