"use client"

import { useState, useEffect } from "react"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useOfflineCollection } from "@/hooks/use-offline-data"
import { addDocument, deleteDocument } from "@/lib/offline-operations"
import { OnlineStatusIndicator } from "@/components/online-status-indicator"
import { DataFreshnessIndicator } from "@/components/data-freshness-indicator"
import { OfflineOperationsQueue } from "@/components/offline-operations-queue"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, RefreshCw, Trash2, WifiOff } from "lucide-react"

export default function OfflineDemoPage() {
  const { isOnline, setOfflineManually, setOnlineManually } = useOnlineStatus()
  const [newNote, setNewNote] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Fetch notes with offline support
  const {
    data: notes,
    loading: notesLoading,
    error: notesError,
    refresh: refreshNotes,
    isStale: notesStale,
  } = useOfflineCollection("notes", [], {
    transform: (data) => ({
      id: data.id,
      content: data.content,
      createdAt: data.createdAt,
      pending: false,
    }),
  })

  // Update last updated timestamp when notes change
  useEffect(() => {
    if (notes) {
      setLastUpdated(new Date())
    }
  }, [notes])

  // Add a new note
  const handleAddNote = async () => {
    if (!newNote.trim()) return

    try {
      await addDocument("notes", { content: newNote.trim() })
      setNewNote("")
      if (isOnline) {
        refreshNotes()
      }
    } catch (error) {
      console.error("Error adding note:", error)
    }
  }

  // Delete a note
  const handleDeleteNote = async (id: string) => {
    try {
      await deleteDocument("notes", id)
      if (isOnline) {
        refreshNotes()
      }
    } catch (error) {
      console.error("Error deleting note:", error)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Offline Demo</h1>
        <OnlineStatusIndicator />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Network Controls</CardTitle>
          <CardDescription>Test offline functionality by simulating network conditions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant={isOnline ? "outline" : "default"} onClick={setOnlineManually} disabled={isOnline}>
              Go Online
            </Button>
            <Button variant={!isOnline ? "outline" : "default"} onClick={setOfflineManually} disabled={!isOnline}>
              <WifiOff className="mr-2 h-4 w-4" />
              Simulate Offline
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Notes</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={refreshNotes} disabled={notesLoading || !isOnline}>
                  <RefreshCw className={cn("h-4 w-4", notesLoading && "animate-spin")} />
                </Button>
                {lastUpdated && <DataFreshnessIndicator lastUpdated={lastUpdated} />}
              </div>
            </div>
            <CardDescription>Create and manage notes with offline support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Add a new note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
              />
              <Button onClick={handleAddNote}>Add</Button>
            </div>

            {notesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : notesError ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-md">Error loading notes: {notesError.message}</div>
            ) : notes && notes.length > 0 ? (
              <ul className="space-y-2">
                {notes.map((note) => (
                  <li key={note.id} className="flex justify-between items-center p-3 bg-muted rounded-md">
                    <span className={note.pending ? "text-muted-foreground italic" : ""}>
                      {note.content}
                      {note.pending && " (pending sync)"}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteNote(note.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No notes yet. Add one above.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Understanding offline capabilities in Mix & Mingle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Offline Data Access</h3>
              <p className="text-sm text-muted-foreground">
                Firebase Firestore caches data locally, allowing you to access previously loaded data even when offline.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Offline Operations Queue</h3>
              <p className="text-sm text-muted-foreground">
                When offline, write operations (add, update, delete) are stored in a queue and processed when you're
                back online.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Data Freshness</h3>
              <p className="text-sm text-muted-foreground">
                The app shows you when data was last updated and warns you if it might be stale.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Network Status</h3>
              <p className="text-sm text-muted-foreground">
                The app detects your network status and adapts accordingly, showing indicators when you're offline.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* This component will show up when there are pending operations */}
      <OfflineOperationsQueue />
    </div>
  )
}

// Helper function for conditional class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
