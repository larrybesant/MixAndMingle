"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import BetaWelcomeEmail from "@/components/emails/beta-welcome-email"
import BetaUpdateEmail from "@/components/emails/beta-update-email"
import BetaFeedbackResponseEmail from "@/components/emails/beta-feedback-response-email"

export function EmailTemplatePreview() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("welcome")
  const [previewData, setPreviewData] = useState({
    username: "John Doe",
    loginUrl: "https://mix-and-mingle.vercel.app/login",
    betaCode: "BETA2025",
    feedbackTitle: "Video Room Audio Quality",
    responseMessage:
      "Thank you for your feedback about the audio quality in video rooms. We've identified the issue and are working on a fix that will be released in the next update.",
  })

  // Update preview data
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPreviewData((prev) => ({ ...prev, [name]: value }))
  }

  // Copy HTML to clipboard
  const copyHtmlToClipboard = () => {
    // In a real implementation, you would generate the HTML here
    // For this demo, we'll just simulate it
    toast({
      title: "HTML copied to clipboard",
      description: "The email template HTML has been copied to your clipboard.",
    })
  }

  // Send test email
  const sendTestEmail = () => {
    // In a real implementation, you would send a test email here
    toast({
      title: "Test email sent",
      description: "A test email has been sent to your address.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Template Preview</CardTitle>
          <CardDescription>Preview and customize email templates for beta communications</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="welcome" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="welcome">Welcome Email</TabsTrigger>
              <TabsTrigger value="update">Update Email</TabsTrigger>
              <TabsTrigger value="feedback">Feedback Response</TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Customize Template</h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium block mb-1">Username</label>
                    <Input name="username" value={previewData.username} onChange={handleInputChange} />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1">Login URL</label>
                    <Input name="loginUrl" value={previewData.loginUrl} onChange={handleInputChange} />
                  </div>

                  {activeTab === "welcome" && (
                    <div>
                      <label className="text-sm font-medium block mb-1">Beta Code</label>
                      <Input name="betaCode" value={previewData.betaCode} onChange={handleInputChange} />
                    </div>
                  )}

                  {activeTab === "feedback" && (
                    <>
                      <div>
                        <label className="text-sm font-medium block mb-1">Feedback Title</label>
                        <Input name="feedbackTitle" value={previewData.feedbackTitle} onChange={handleInputChange} />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">Response Message</label>
                        <Input
                          name="responseMessage"
                          value={previewData.responseMessage}
                          onChange={handleInputChange}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-4 space-y-2">
                  <Button onClick={copyHtmlToClipboard} variant="outline" className="w-full">
                    Copy HTML
                  </Button>
                  <Button onClick={sendTestEmail} className="w-full">
                    Send Test Email
                  </Button>
                </div>
              </div>

              <div className="md:col-span-2 border rounded-md overflow-hidden">
                <div className="bg-gray-100 p-2 text-sm font-medium border-b">Email Preview</div>
                <div className="p-4 max-h-[600px] overflow-y-auto bg-white">
                  {activeTab === "welcome" && (
                    <div className="prose max-w-none">
                      <BetaWelcomeEmail
                        username={previewData.username}
                        loginUrl={previewData.loginUrl}
                        betaCode={previewData.betaCode}
                      />
                    </div>
                  )}

                  {activeTab === "update" && (
                    <div className="prose max-w-none">
                      <BetaUpdateEmail
                        username={previewData.username}
                        loginUrl={previewData.loginUrl}
                        updates={[
                          {
                            title: "New Video Room Features",
                            description: "We've added DJ mode and improved audio quality in video rooms.",
                          },
                          {
                            title: "Enhanced Chat Experience",
                            description: "Chat now supports reactions, GIFs, and improved notifications.",
                          },
                        ]}
                        tasks={[
                          {
                            title: "Try the new DJ mode",
                            description: "Create a video room and test the new DJ features.",
                          },
                          {
                            title: "Test chat reactions",
                            description: "Use the new reaction feature in chat rooms and provide feedback.",
                          },
                        ]}
                      />
                    </div>
                  )}

                  {activeTab === "feedback" && (
                    <div className="prose max-w-none">
                      <BetaFeedbackResponseEmail
                        username={previewData.username}
                        loginUrl={previewData.loginUrl}
                        feedbackTitle={previewData.feedbackTitle}
                        responseMessage={previewData.responseMessage}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
