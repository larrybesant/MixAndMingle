"use client"

import { useState } from "react"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Clipboard, Download } from "lucide-react"

export function BetaInviteGenerator() {
  const [quantity, setQuantity] = useState("10")
  const [accessLevel, setAccessLevel] = useState("standard")
  const [expiryDays, setExpiryDays] = useState("7")
  const [generatedCodes, setGeneratedCodes] = useState<Array<{ code: string; accessLevel: string; expiresAt: Date }>>(
    [],
  )
  const [generating, setGenerating] = useState(false)

  const generateRandomCode = () => {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  const handleGenerateCodes = async () => {
    setGenerating(true)

    try {
      const qty = Number.parseInt(quantity)
      const days = Number.parseInt(expiryDays)
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + days)

      const newCodes = []

      for (let i = 0; i < qty; i++) {
        const code = generateRandomCode()

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

        newCodes.push({
          code,
          accessLevel,
          expiresAt: expiryDate,
        })
      }

      setGeneratedCodes(newCodes)
      toast({
        title: "Invitation Codes Generated",
        description: `Successfully created ${qty} beta invitation codes.`,
      })
    } catch (error) {
      console.error("Error generating beta codes:", error)
      toast({
        title: "Error",
        description: "Failed to generate invitation codes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = () => {
    const text = generatedCodes.map((c) => c.code).join("\n")
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to Clipboard",
      description: `${generatedCodes.length} codes copied to clipboard.`,
    })
  }

  const downloadCsv = () => {
    const headers = ["Code", "Access Level", "Expires At"]
    const csvContent = [
      headers.join(","),
      ...generatedCodes.map((c) => [c.code, c.accessLevel, c.expiresAt.toISOString().split("T")[0]].join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `beta-codes-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Beta Invitation Codes</CardTitle>
          <CardDescription>Create unique codes to invite users to your beta program</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="quantity">Number of Codes</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
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
        </CardContent>

        <CardFooter>
          <Button onClick={handleGenerateCodes} disabled={generating} className="w-full md:w-auto">
            {generating ? "Generating..." : "Generate Invitation Codes"}
          </Button>
        </CardFooter>
      </Card>

      {generatedCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Invitation Codes</CardTitle>
            <CardDescription>
              {generatedCodes.length} codes generated. These codes expire on{" "}
              {generatedCodes[0].expiresAt.toLocaleDateString()}.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Access Level</TableHead>
                    <TableHead>Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedCodes.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono">{item.code}</TableCell>
                      <TableCell className="capitalize">{item.accessLevel}</TableCell>
                      <TableCell>{item.expiresAt.toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={copyToClipboard}>
              <Clipboard className="mr-2 h-4 w-4" />
              Copy All Codes
            </Button>
            <Button variant="outline" onClick={downloadCsv}>
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
