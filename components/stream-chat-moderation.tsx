"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Ban, Shield } from "lucide-react"

interface StreamChatModerationProps {
  streamId: string
}

export function StreamChatModeration({ streamId }: StreamChatModerationProps) {
  const [autoModEnabled, setAutoModEnabled] = useState(true)
  const [slowModeEnabled, setSlowModeEnabled] = useState(false)
  const [slowModeInterval, setSlowModeInterval] = useState(5)
  const [bannedWords, setBannedWords] = useState<string[]>([])
  const [newBannedWord, setNewBannedWord] = useState("")

  const handleAddBannedWord = (e: React.FormEvent) => {
    e.preventDefault()
    if (newBannedWord.trim() && !bannedWords.includes(newBannedWord.trim().toLowerCase())) {
      setBannedWords([...bannedWords, newBannedWord.trim().toLowerCase()])
      setNewBannedWord("")
    }
  }

  const handleRemoveBannedWord = (word: string) => {
    setBannedWords(bannedWords.filter((w) => w !== word))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Chat Moderation
        </CardTitle>
        <CardDescription>Control your stream chat settings and moderation tools</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-mod">Automatic Moderation</Label>
              <p className="text-sm text-muted-foreground">Automatically filter offensive language and spam</p>
            </div>
            <Switch id="auto-mod" checked={autoModEnabled} onCheckedChange={setAutoModEnabled} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="slow-mode">Slow Mode</Label>
              <p className="text-sm text-muted-foreground">Limit how often viewers can send messages</p>
            </div>
            <Switch id="slow-mode" checked={slowModeEnabled} onCheckedChange={setSlowModeEnabled} />
          </div>

          {slowModeEnabled && (
            <div className="pl-6 pt-2">
              <Label htmlFor="slow-mode-interval">Seconds between messages</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="slow-mode-interval"
                  type="number"
                  min={1}
                  max={120}
                  value={slowModeInterval}
                  onChange={(e) => setSlowModeInterval(Number.parseInt(e.target.value) || 5)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">seconds</span>
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <Label htmlFor="banned-words">Banned Words</Label>
            <p className="text-sm text-muted-foreground mb-2">Messages containing these words will be blocked</p>

            <form onSubmit={handleAddBannedWord} className="flex gap-2 mb-3">
              <Input
                id="banned-words"
                value={newBannedWord}
                onChange={(e) => setNewBannedWord(e.target.value)}
                placeholder="Add a banned word..."
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={!newBannedWord.trim()}>
                Add
              </Button>
            </form>

            <div className="flex flex-wrap gap-2">
              {bannedWords.length === 0 ? (
                <p className="text-sm text-muted-foreground">No banned words added yet</p>
              ) : (
                bannedWords.map((word) => (
                  <Badge key={word} variant="secondary" className="gap-1">
                    {word}
                    <button
                      type="button"
                      onClick={() => handleRemoveBannedWord(word)}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20 h-4 w-4 inline-flex items-center justify-center"
                    >
                      ×
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <Button variant="outline" className="w-full gap-2">
            <Ban className="h-4 w-4" />
            Manage Banned Users
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
