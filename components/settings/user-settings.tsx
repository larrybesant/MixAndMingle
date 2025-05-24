"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bell, Shield, CreditCard, Crown, Trash2, Download } from "lucide-react"

export default function UserSettings() {
  const [notifications, setNotifications] = useState({
    messages: true,
    videoCalls: true,
    friendRequests: true,
    gifts: true,
    marketing: false,
  })

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    onlineStatus: true,
    readReceipts: true,
    allowDirectMessages: true,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="messages">New Messages</Label>
                  <p className="text-sm text-gray-600">Get notified when someone sends you a message</p>
                </div>
                <Switch
                  id="messages"
                  checked={notifications.messages}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, messages: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="videoCalls">Video Call Invites</Label>
                  <p className="text-sm text-gray-600">Get notified when someone invites you to a video call</p>
                </div>
                <Switch
                  id="videoCalls"
                  checked={notifications.videoCalls}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, videoCalls: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="friendRequests">Friend Requests</Label>
                  <p className="text-sm text-gray-600">Get notified when someone wants to connect</p>
                </div>
                <Switch
                  id="friendRequests"
                  checked={notifications.friendRequests}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, friendRequests: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="gifts">Virtual Gifts</Label>
                  <p className="text-sm text-gray-600">Get notified when you receive virtual gifts</p>
                </div>
                <Switch
                  id="gifts"
                  checked={notifications.gifts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, gifts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="marketing">Marketing Updates</Label>
                  <p className="text-sm text-gray-600">Receive updates about new features and promotions</p>
                </div>
                <Switch
                  id="marketing"
                  checked={notifications.marketing}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Privacy Settings</span>
              </CardTitle>
              <CardDescription>Control who can see your information and activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="profileVisible">Profile Visibility</Label>
                  <p className="text-sm text-gray-600">Allow others to find and view your profile</p>
                </div>
                <Switch
                  id="profileVisible"
                  checked={privacy.profileVisible}
                  onCheckedChange={(checked) => setPrivacy({ ...privacy, profileVisible: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="onlineStatus">Show Online Status</Label>
                  <p className="text-sm text-gray-600">Let others see when you're online</p>
                </div>
                <Switch
                  id="onlineStatus"
                  checked={privacy.onlineStatus}
                  onCheckedChange={(checked) => setPrivacy({ ...privacy, onlineStatus: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="readReceipts">Read Receipts</Label>
                  <p className="text-sm text-gray-600">Show others when you've read their messages</p>
                </div>
                <Switch
                  id="readReceipts"
                  checked={privacy.readReceipts}
                  onCheckedChange={(checked) => setPrivacy({ ...privacy, readReceipts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowDirectMessages">Allow Direct Messages</Label>
                  <p className="text-sm text-gray-600">Let anyone send you direct messages</p>
                </div>
                <Switch
                  id="allowDirectMessages"
                  checked={privacy.allowDirectMessages}
                  onCheckedChange={(checked) => setPrivacy({ ...privacy, allowDirectMessages: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Subscription Management</span>
              </CardTitle>
              <CardDescription>Manage your Mix & Mingle subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                <div className="flex items-center space-x-3">
                  <Crown className="h-8 w-8 text-yellow-600" />
                  <div>
                    <h3 className="font-medium">Premium Plan</h3>
                    <p className="text-sm text-gray-600">$9.99/month • Renews on Feb 15, 2024</p>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Active</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Update Payment Method
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoices
                </Button>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Upgrade to VIP</h4>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium">VIP Plan</h3>
                      <p className="text-sm text-gray-600">
                        $19.99/month • All Premium features plus exclusive VIP rooms
                      </p>
                    </div>
                    <Button>Upgrade</Button>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Large group video calls (up to 50 people)</li>
                    <li>• Exclusive VIP chat rooms</li>
                    <li>• Virtual gifts and profile boost</li>
                    <li>• Priority customer support</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
              <CardDescription>Manage your account settings and data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Change Password</h4>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button>Update Password</Button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Data Export</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Download a copy of your data including messages, profile information, and activity history.
                </p>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Request Data Export
                </Button>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4 text-red-600">Danger Zone</h4>
                <div className="space-y-4">
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h5 className="font-medium text-red-800 mb-2">Delete Account</h5>
                    <p className="text-sm text-red-700 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
