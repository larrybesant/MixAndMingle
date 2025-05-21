"use client"

import { useState } from "react"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Clipboard, Share2 } from "lucide-react"

export function BetaInviteLinkGenerator() {
  const [inviteCode, setInviteCode] = useState("")
  const [accessLevel, setAccessLevel] = useState("standard")
  const [expiryDays, setExpiryDays] = useState("7")
  const [generatedLink, setGeneratedLink] = useState("")
  const [generating, setGenerating] = useState(false)

  const generateRandomCode = () => {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  const handleGenerateLink = async () => {
    setGenerating(true)

    try {
      // Generate a new invite code if one isn't provided
      const code = inviteCode || generateRandomCode()
      setInviteCode(code)

      const days = Number.parseInt(expiryDays)
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + days)

      // Save to Firestore
      await addDoc(collection(db, "betaInviteCodes"), {
        code,
        accessLevel,
        createdAt: serverTimestamp(),
        expiresAt: expiryDate,
        used: false,
        usedBy: null,
        usedAt: null,
      })

      // Generate the shareable link
      const baseUrl = window.location.origin
      const link = `${baseUrl}/beta/invite?code=${code}`
      setGeneratedLink(link)

      toast({
        title: "Invitation Link Generated",
        description: `Successfully created a beta invitation link with code: ${code}`,
      })
    } catch (error) {
      console.error("Error generating beta invite link:", error)
      toast({
        title: "Error",
        description: "Failed to generate invitation link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink)
    toast({
      title: "Copied to Clipboard",
      description: "The invitation link has been copied to your clipboard.",
    })
  }

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join the Mix & Mingle Beta",
          text: "You're invited to join the Mix & Mingle beta testing program!",
          url: generatedLink,
        })
        toast({
          title: "Link Shared",
          description: "The invitation link has been shared.",
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Beta Invitation Link</CardTitle>
        <CardDescription>Create a shareable link to invite users to your beta program</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Custom Code (Optional)</Label>
              <Input
                id="inviteCode"
                placeholder="Leave blank to generate random"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessLevel">Access Level</Label>
              <Select value={accessLevel} onValueChange={setAccessLevel}>
                <SelectTrigger id="accessLevel">
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDays">Expires After (Days)</Label>
              <Input
                id="expiryDays"
                type="number"
                min="1"
                max="90"
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
              />
            </div>
          </div>

          {generatedLink && (
            <div className="space-y-2 pt-4">
              <Label htmlFor="generatedLink">Invitation Link</Label>
              <div className="flex gap-2">
                <Input id="generatedLink" value={generatedLink} readOnly className="flex-1" />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  <Clipboard className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={shareLink}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground pt-1">
                This link will expire in {expiryDays} days. Share it with potential beta testers.
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={handleGenerateLink} disabled={generating} className="w-full md:w-auto">
          {generating ? "Generating..." : "Generate Invitation Link"}
        </Button>
      </CardFooter>
    </Card>
  )
}
