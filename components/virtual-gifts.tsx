"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc, doc, updateDoc, increment } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Gift, Heart, Star, Award, Diamond, Crown } from "lucide-react"

const gifts = [
  {
    id: "heart",
    name: "Heart",
    description: "Show some love",
    price: 5,
    icon: Heart,
    premium: false,
  },
  {
    id: "star",
    name: "Star",
    description: "You're a star",
    price: 10,
    icon: Star,
    premium: false,
  },
  {
    id: "gift",
    name: "Gift Box",
    description: "A special gift",
    price: 20,
    icon: Gift,
    premium: false,
  },
  {
    id: "award",
    name: "Award",
    description: "Recognition of excellence",
    price: 50,
    icon: Award,
    premium: true,
  },
  {
    id: "diamond",
    name: "Diamond",
    description: "Rare and precious",
    price: 100,
    icon: Diamond,
    premium: true,
  },
  {
    id: "crown",
    name: "Crown",
    description: "Fit for royalty",
    price: 200,
    icon: Crown,
    premium: true,
  },
]

export function VirtualGifts() {
  const [selectedGift, setSelectedGift] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSendGift = async () => {
    if (!user || !selectedGift || !selectedUser) return

    setIsLoading(true)
    try {
      const gift = gifts.find((g) => g.id === selectedGift)

      if (!gift) {
        throw new Error("Gift not found")
      }

      // In a real app, you would check if the user has enough credits
      // and handle the payment processing

      // Record the gift transaction
      await addDoc(collection(db, "gifts"), {
        giftId: gift.id,
        giftName: gift.name,
        price: gift.price,
        senderId: user.uid,
        senderName: user.displayName,
        recipientId: selectedUser,
        timestamp: new Date().toISOString(),
      })

      // Update recipient's gift count
      const recipientRef = doc(db, "users", selectedUser)
      await updateDoc(recipientRef, {
        giftsReceived: increment(1),
        totalGiftValue: increment(gift.price),
      })

      toast({
        title: "Gift sent",
        description: `You've sent a ${gift.name} to the user.`,
      })

      setDialogOpen(false)
      setSelectedGift(null)
      setSelectedUser("")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send gift. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {gifts.map((gift) => (
        <Card key={gift.id} className={gift.premium ? "border-primary" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{gift.name}</CardTitle>
              <gift.icon className="h-8 w-8 text-primary" />
            </div>
            <CardDescription>{gift.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{gift.price} coins</p>
            {gift.premium && <p className="text-sm text-muted-foreground mt-1">Premium gift</p>}
          </CardContent>
          <CardFooter>
            <Dialog
              open={dialogOpen && selectedGift === gift.id}
              onOpenChange={(open) => {
                setDialogOpen(open)
                if (!open) setSelectedGift(null)
              }}
            >
              <DialogTrigger asChild>
                <Button
                  className="w-full"
                  onClick={() => setSelectedGift(gift.id)}
                  variant={gift.premium ? "default" : "outline"}
                >
                  Send Gift
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send {gift.name}</DialogTitle>
                  <DialogDescription>Choose a user to send this gift to.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="user">Select User</label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user1">John Doe</SelectItem>
                        <SelectItem value="user2">Jane Smith</SelectItem>
                        <SelectItem value="user3">Alex Johnson</SelectItem>
                        <SelectItem value="user4">Sarah Williams</SelectItem>
                        <SelectItem value="user5">Michael Brown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSendGift} disabled={isLoading || !selectedUser}>
                    {isLoading ? "Sending..." : `Send for ${gift.price} coins`}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
