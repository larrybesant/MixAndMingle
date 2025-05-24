"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Database,
  ExternalLink,
  Copy,
  RefreshCw,
  Search,
  User,
  BarChart3,
  Shield,
  Crown,
  Calendar,
  MapPin,
  Mail,
  Eye,
  FileText,
} from "lucide-react"
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"

interface FirestoreUser {
  uid: string
  email: string
  displayName: string
  firstName: string
  lastName: string
  username: string
  bio: string
  location: string
  website: string
  photoURL: string
  subscriptionTier: "free" | "premium" | "vip"
  joinDate: any
  lastActive: any
  stats: {
    messagesSent: number
    videoCalls: number
    connections: number
    giftsReceived: number
  }
  settings: {
    notifications: {
      messages: boolean
      videoCalls: boolean
      friendRequests: boolean
      gifts: boolean
      marketing: boolean
    }
    privacy: {
      profileVisible: boolean
      onlineStatus: boolean
      readReceipts: boolean
      allowDirectMessages: boolean
    }
  }
}

export default function FirestoreConsoleViewer() {
  const { user, userData } = useAuth()
  const [recentUsers, setRecentUsers] = useState<FirestoreUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [copiedText, setCopiedText] = useState("")
  const [selectedUser, setSelectedUser] = useState<FirestoreUser | null>(null)

  const firebaseConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  }

  // Direct Firestore Console URLs
  const firestoreUrls = {
    main: `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/data`,
    users: `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/data/~2Fusers`,
    rules: `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/rules`,
    indexes: `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/indexes`,
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(label)
      setTimeout(() => setCopiedText(""), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const fetchRecentUsers = async () => {
    setIsLoading(true)
    try {
      const usersQuery = query(collection(db, "users"), orderBy("joinDate", "desc"), limit(15))

      const querySnapshot = await getDocs(usersQuery)
      const users = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as FirestoreUser[]

      setRecentUsers(users)
      setLastRefresh(new Date())
    } catch (error) {
      console.error("Error fetching users:", error)
    }
    setIsLoading(false)
  }

  const searchUsers = async () => {
    if (!searchTerm.trim()) {
      fetchRecentUsers()
      return
    }

    setIsLoading(true)
    try {
      // Search by email
      const emailQuery = query(
        collection(db, "users"),
        where("email", ">=", searchTerm),
        where("email", "<=", searchTerm + "\uf8ff"),
        limit(10),
      )

      // Search by username
      const usernameQuery = query(
        collection(db, "users"),
        where("username", ">=", searchTerm),
        where("username", "<=", searchTerm + "\uf8ff"),
        limit(10),
      )

      const [emailSnapshot, usernameSnapshot] = await Promise.all([getDocs(emailQuery), getDocs(usernameQuery)])

      const emailUsers = emailSnapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }))
      const usernameUsers = usernameSnapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }))

      // Combine and deduplicate
      const allUsers = [...emailUsers, ...usernameUsers]
      const uniqueUsers = allUsers.filter(
        (user, index, self) => index === self.findIndex((u) => u.uid === user.uid),
      ) as FirestoreUser[]

      setRecentUsers(uniqueUsers)
      setLastRefresh(new Date())
    } catch (error) {
      console.error("Error searching users:", error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchRecentUsers()
  }, [])

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleString()
    } catch {
      return "Invalid date"
    }
  }

  const getTimeSince = (timestamp: any) => {
    if (!timestamp) return "N/A"
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMins < 1) return "Just now"
      if (diffMins < 60) return `${diffMins} minutes ago`
      if (diffHours < 24) return `${diffHours} hours ago`
      return `${diffDays} days ago`
    } catch {
      return "N/A"
    }
  }

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case "vip":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Crown className="h-3 w-3 mr-1" />
            VIP
          </Badge>
        )
      case "premium":
        return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
      default:
        return <Badge variant="secondary">Free</Badge>
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Direct Console Access */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-2xl">
            <Database className="h-8 w-8 text-purple-600" />
            <span>🗄️ Firestore Database Console</span>
          </CardTitle>
          <CardDescription className="text-lg">
            View complete user profile data stored in Firestore with detailed document structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Direct Console Access Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button asChild className="h-16 flex-col space-y-2">
                <a href={firestoreUrls.users} target="_blank" rel="noopener noreferrer">
                  <User className="h-6 w-6" />
                  <span>Users Collection</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
              <Button asChild variant="outline" className="h-16 flex-col space-y-2">
                <a href={firestoreUrls.main} target="_blank" rel="noopener noreferrer">
                  <Database className="h-6 w-6" />
                  <span>All Collections</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
              <Button asChild variant="outline" className="h-16 flex-col space-y-2">
                <a href={firestoreUrls.rules} target="_blank" rel="noopener noreferrer">
                  <Shield className="h-6 w-6" />
                  <span>Security Rules</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
              <Button asChild variant="outline" className="h-16 flex-col space-y-2">
                <a href={firestoreUrls.indexes} target="_blank" rel="noopener noreferrer">
                  <BarChart3 className="h-6 w-6" />
                  <span>Indexes</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>

            {/* Project Info */}
            <Card className="bg-white/70">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Project ID:</span>
                    <div className="flex items-center space-x-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">{firebaseConfig.projectId}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(firebaseConfig.projectId || "", "Project ID")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Collection:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">users</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Documents:</span>
                    <Badge variant="outline">{recentUsers.length} loaded</Badge>
                  </div>
                </div>
                {copiedText && (
                  <Alert className="mt-2 border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">✅ {copiedText} copied to clipboard!</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>🔍 Search Users</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Search by email or username:</Label>
              <Input
                id="search"
                placeholder="Enter email or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchUsers()}
              />
            </div>
            <div className="flex space-x-2 items-end">
              <Button onClick={searchUsers} disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button onClick={fetchRecentUsers} variant="outline" disabled={isLoading}>
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {lastRefresh && (
            <p className="text-sm text-gray-500 mt-2">Last updated: {lastRefresh.toLocaleTimeString()}</p>
          )}
        </CardContent>
      </Card>

      {/* Current User Highlight */}
      {user && userData && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-600" />
              <span>👤 Your Current User Document</span>
            </CardTitle>
            <CardDescription>This is your user document as stored in Firestore</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Document ID (UID):</span>
                  <div className="flex items-center space-x-2">
                    <code className="bg-white px-2 py-1 rounded text-xs">{user.uid.slice(0, 12)}...</code>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(user.uid, "UID")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Collection Path:</span>
                  <code className="bg-white px-2 py-1 rounded text-xs">users/{user.uid}</code>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Display Name:</span>
                  <span>{userData.displayName}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Username:</span>
                  <span>@{userData.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Subscription:</span>
                  {getSubscriptionBadge(userData.subscriptionTier)}
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Document Created:</span>
                  <span>{formatDate(userData.joinDate)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>📋 User Documents</span>
              </span>
              <Badge variant="outline">{recentUsers.length} documents</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                <span>Loading user documents...</span>
              </div>
            ) : recentUsers.length === 0 ? (
              <Alert>
                <AlertDescription>No user documents found. Try running a test to create some users.</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((firestoreUser, index) => (
                  <Card
                    key={firestoreUser.uid}
                    className={`border-l-4 border-l-blue-500 cursor-pointer transition-colors ${
                      selectedUser?.uid === firestoreUser.uid ? "bg-blue-50 ring-2 ring-blue-200" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedUser(firestoreUser)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="font-medium text-sm">
                            {firestoreUser.firstName} {firestoreUser.lastName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getSubscriptionBadge(firestoreUser.subscriptionTier)}
                          <span className="text-xs text-gray-500">{getTimeSince(firestoreUser.joinDate)}</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 space-y-1">
                        <div>📧 {firestoreUser.email}</div>
                        <div>👤 @{firestoreUser.username}</div>
                        <div>🆔 {firestoreUser.uid.slice(0, 12)}...</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected User Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>📄 Document Details</span>
            </CardTitle>
            <CardDescription>
              {selectedUser ? `Viewing document: users/${selectedUser.uid}` : "Select a user to view document details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        Name:
                      </span>
                      <span>{selectedUser.displayName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        Email:
                      </span>
                      <span className="text-xs">{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Username:</span>
                      <span>@{selectedUser.username}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium flex items-center">
                        <Crown className="h-4 w-4 mr-1" />
                        Subscription:
                      </span>
                      {getSubscriptionBadge(selectedUser.subscriptionTier)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Joined:
                      </span>
                      <span className="text-xs">{formatDate(selectedUser.joinDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Location:
                      </span>
                      <span>{selectedUser.location || "Not set"}</span>
                    </div>
                    {selectedUser.bio && (
                      <div className="pt-2 border-t">
                        <span className="font-medium">Bio:</span>
                        <p className="text-gray-600 mt-1">{selectedUser.bio}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <div className="text-2xl font-bold text-purple-600">{selectedUser.stats?.messagesSent || 0}</div>
                      <div className="text-xs text-gray-600">Messages Sent</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">{selectedUser.stats?.videoCalls || 0}</div>
                      <div className="text-xs text-gray-600">Video Calls</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">{selectedUser.stats?.connections || 0}</div>
                      <div className="text-xs text-gray-600">Connections</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded">
                      <div className="text-2xl font-bold text-orange-600">{selectedUser.stats?.giftsReceived || 0}</div>
                      <div className="text-xs text-gray-600">Gifts Received</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">🔔 Notifications</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span>Messages:</span>
                          <Badge
                            variant={selectedUser.settings?.notifications?.messages ? "default" : "secondary"}
                            className="h-4"
                          >
                            {selectedUser.settings?.notifications?.messages ? "On" : "Off"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Video Calls:</span>
                          <Badge
                            variant={selectedUser.settings?.notifications?.videoCalls ? "default" : "secondary"}
                            className="h-4"
                          >
                            {selectedUser.settings?.notifications?.videoCalls ? "On" : "Off"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Friend Requests:</span>
                          <Badge
                            variant={selectedUser.settings?.notifications?.friendRequests ? "default" : "secondary"}
                            className="h-4"
                          >
                            {selectedUser.settings?.notifications?.friendRequests ? "On" : "Off"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Gifts:</span>
                          <Badge
                            variant={selectedUser.settings?.notifications?.gifts ? "default" : "secondary"}
                            className="h-4"
                          >
                            {selectedUser.settings?.notifications?.gifts ? "On" : "Off"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">🔒 Privacy</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span>Profile Visible:</span>
                          <Badge
                            variant={selectedUser.settings?.privacy?.profileVisible ? "default" : "secondary"}
                            className="h-4"
                          >
                            {selectedUser.settings?.privacy?.profileVisible ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Online Status:</span>
                          <Badge
                            variant={selectedUser.settings?.privacy?.onlineStatus ? "default" : "secondary"}
                            className="h-4"
                          >
                            {selectedUser.settings?.privacy?.onlineStatus ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Read Receipts:</span>
                          <Badge
                            variant={selectedUser.settings?.privacy?.readReceipts ? "default" : "secondary"}
                            className="h-4"
                          >
                            {selectedUser.settings?.privacy?.readReceipts ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Direct Messages:</span>
                          <Badge
                            variant={selectedUser.settings?.privacy?.allowDirectMessages ? "default" : "secondary"}
                            className="h-4"
                          >
                            {selectedUser.settings?.privacy?.allowDirectMessages ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="raw" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Document Path:</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(`users/${selectedUser.uid}`, "Document path")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <code className="block bg-gray-100 p-2 rounded text-xs">users/{selectedUser.uid}</code>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Raw Document Data:</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(JSON.stringify(selectedUser, null, 2), "Raw data")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto max-h-64 overflow-y-auto">
                      {JSON.stringify(selectedUser, null, 2)}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a user from the list to view their complete document structure</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Console Navigation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Firestore Console Navigation Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Badge variant="outline" className="mt-1">
                1
              </Badge>
              <div>
                <strong>Click "Users Collection" button above</strong>
                <p className="text-sm text-gray-600 mt-1">Opens directly to the users collection in Firestore</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Badge variant="outline" className="mt-1">
                2
              </Badge>
              <div>
                <strong>Browse user documents</strong>
                <p className="text-sm text-gray-600 mt-1">
                  Each document ID corresponds to a user's UID from Firebase Auth
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Badge variant="outline" className="mt-1">
                3
              </Badge>
              <div>
                <strong>Click any document to view details</strong>
                <p className="text-sm text-gray-600 mt-1">
                  See all fields including personal info, settings, and stats
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Badge variant="outline" className="mt-1">
                4
              </Badge>
              <div>
                <strong>Look for these key fields:</strong>
                <ul className="text-sm text-gray-600 mt-1 ml-4 list-disc">
                  <li>
                    <code>firstName</code>, <code>lastName</code>, <code>username</code> - Personal info
                  </li>
                  <li>
                    <code>subscriptionTier</code> - User's subscription level
                  </li>
                  <li>
                    <code>stats</code> - Usage statistics object
                  </li>
                  <li>
                    <code>settings</code> - Notification and privacy preferences
                  </li>
                  <li>
                    <code>joinDate</code>, <code>lastActive</code> - Timestamps
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-12">
              <a href="/firebase-auth-console">
                <Shield className="h-4 w-4 mr-2" />
                View Firebase Auth
              </a>
            </Button>
            <Button asChild variant="outline" className="h-12">
              <a href="/test-live" target="_blank" rel="noreferrer">
                <RefreshCw className="h-4 w-4 mr-2" />
                Create Test User
              </a>
            </Button>
            <Button asChild variant="outline" className="h-12">
              <a href="/auth/login">
                <User className="h-4 w-4 mr-2" />
                Test Login
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
