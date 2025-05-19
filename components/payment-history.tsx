"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Payment {
  id: string
  sender_id: string
  recipient_id: string
  amount: number
  currency: string
  status: string
  created_at: string
  sender?: {
    id: string
    username: string
    avatar_url: string | null
  }
  recipient?: {
    id: string
    username: string
    avatar_url: string | null
  }
}

export function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const fetchPayments = async () => {
      try {
        const response = await fetch(`/api/payments?userId=${user.id}`)
        const data = await response.json()

        if (response.ok) {
          setPayments(data.payments || [])
        }
      } catch (error) {
        console.error("Error fetching payments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayments()
  }, [user])

  if (isLoading) {
    return <div>Loading payment history...</div>
  }

  if (payments.length === 0) {
    return <div>No payment history found.</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>Your recent payments and tips</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                {payment.sender_id === user?.id ? (
                  <>
                    <Avatar>
                      <AvatarImage src={payment.recipient?.avatar_url || ""} />
                      <AvatarFallback>{payment.recipient?.username?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        Tip to <span className="text-primary">{payment.recipient?.username}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Avatar>
                      <AvatarImage src={payment.sender?.avatar_url || ""} />
                      <AvatarFallback>{payment.sender?.username?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        Tip from <span className="text-primary">{payment.sender?.username}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold">
                  {payment.sender_id === user?.id ? "-" : "+"}
                  {payment.amount} {payment.currency}
                </p>
                <Badge
                  variant={
                    payment.status === "completed"
                      ? "success"
                      : payment.status === "pending"
                        ? "outline"
                        : "destructive"
                  }
                >
                  {payment.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
