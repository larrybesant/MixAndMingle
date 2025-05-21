"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquareIcon, BugIcon } from "lucide-react"
import { BugReportForm } from "./bug-report-form"
import { FeedbackForm } from "./feedback-form"
import { trackBetaEvent } from "@/lib/sentry"

export function InAppFeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("feedback")

  const handleOpen = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      trackBetaEvent("feedback_widget_opened")
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    trackBetaEvent("feedback_widget_tab_changed", { tab: value })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-4 right-4 rounded-full shadow-lg z-50" size="lg">
          <MessageSquareIcon className="mr-2 h-4 w-4" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Your Thoughts</DialogTitle>
          <DialogDescription>Help us improve Mix & Mingle by sharing your feedback or reporting bugs</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="feedback" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="feedback" className="flex items-center">
              <MessageSquareIcon className="mr-2 h-4 w-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="bug" className="flex items-center">
              <BugIcon className="mr-2 h-4 w-4" />
              Report Bug
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feedback">
            <FeedbackForm />
          </TabsContent>

          <TabsContent value="bug">
            <BugReportForm />
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
