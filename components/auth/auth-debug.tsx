"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AuthDebug() {
  const { user, userData, loading } = useAuth()

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-h-96 overflow-y-auto z-50 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">🔍 Auth Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span>Loading:</span>
          <Badge variant={loading ? "destructive" : "default"}>{loading ? "Yes" : "No"}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>User:</span>
          <Badge variant={user ? "default" : "secondary"}>{user ? "Authenticated" : "Not authenticated"}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>User Data:</span>
          <Badge variant={userData ? "default" : "secondary"}>{userData ? "Loaded" : "Not loaded"}</Badge>
        </div>
        {user && (
          <div className="pt-2 border-t">
            <div>UID: {user.uid.slice(0, 8)}...</div>
            <div>Email: {user.email}</div>
            {userData && <div>Name: {userData.displayName}</div>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
