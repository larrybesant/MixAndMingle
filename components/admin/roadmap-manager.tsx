"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RoadmapItem, RoadmapStatus, RoadmapCategory } from "@/lib/roadmap-service"
import { PlusCircle, Edit, Trash2, LinkIcon } from "lucide-react"

interface RoadmapManagerProps {
  roadmapItems: RoadmapItem[]
  feedbackItems: any[] // Simplified for brevity
  onCreateItem: (data: any) => Promise<void>
  onUpdateItem: (id: string, data: any) => Promise<void>
  onDeleteItem: (id: string) => Promise<void>
  onLinkFeedback: (roadmapId: string, feedbackId: string) => Promise<void>
}

export function RoadmapManager({
  roadmapItems,
  feedbackItems,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
  onLinkFeedback,
}: RoadmapManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<RoadmapItem | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "planned" as RoadmapStatus,
    category: "feature" as RoadmapCategory,
    priority: 3,
    estimatedCompletion: "",
    tags: "",
    assignedTo: "",
  })
  const [selectedFeedbackIds, setSelectedFeedbackIds] = useState<string[]>([])

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "planned",
      category: "feature",
      priority: 3,
      estimatedCompletion: "",
      tags: "",
      assignedTo: "",
    })
  }

  const handleEditItem = (item: RoadmapItem) => {
    setSelectedItem(item)
    setFormData({
      title: item.title,
      description: item.description,
      status: item.status,
      category: item.category,
      priority: item.priority,
      estimatedCompletion: item.estimatedCompletion || "",
      tags: item.tags.join(", "),
      assignedTo: item.assignedTo || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleLinkFeedback = (item: RoadmapItem) => {
    setSelectedItem(item)
    setSelectedFeedbackIds(item.relatedFeedbackIds || [])
    setIsLinkDialogOpen(true)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onCreateItem({
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        relatedFeedbackIds: [],
      })
      setIsCreateDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error creating roadmap item:", error)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return

    try {
      await onUpdateItem(selectedItem.id, {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      })
      setIsEditDialogOpen(false)
      setSelectedItem(null)
    } catch (error) {
      console.error("Error updating roadmap item:", error)
    }
  }

  const handleLinkSubmit = async () => {
    if (!selectedItem) return

    try {
      // Find new feedback IDs to link
      const newFeedbackIds = selectedFeedbackIds.filter((id) => !selectedItem.relatedFeedbackIds.includes(id))

      // Link each new feedback item
      for (const feedbackId of newFeedbackIds) {
        await onLinkFeedback(selectedItem.id, feedbackId)
      }

      setIsLinkDialogOpen(false)
      setSelectedItem(null)
    } catch (error) {
      console.error("Error linking feedback:", error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this roadmap item? This action cannot be undone.")) {
      try {
        await onDeleteItem(id)
      } catch (error) {
        console.error("Error deleting roadmap item:", error)
      }
    }
  }

  const getStatusColor = (status: RoadmapStatus) => {
    const colors: Record<string, string> = {
      planned: "bg-blue-100 text-blue-800",
      "in-progress": "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      "on-hold": "bg-gray-100 text-gray-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Roadmap Management</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Roadmap Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Roadmap Item</DialogTitle>
              <DialogDescription>Add a new feature, enhancement, or bug fix to the public roadmap.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as RoadmapStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value as RoadmapCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feature">Feature</SelectItem>
                        <SelectItem value="enhancement">Enhancement</SelectItem>
                        <SelectItem value="bug-fix">Bug Fix</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="ui-ux">UI/UX</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority (1-5)</Label>
                    <Select
                      value={formData.priority.toString()}
                      onValueChange={(value) => setFormData({ ...formData, priority: Number.parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 (Lowest)</SelectItem>
                        <SelectItem value="2">2 (Low)</SelectItem>
                        <SelectItem value="3">3 (Medium)</SelectItem>
                        <SelectItem value="4">4 (High)</SelectItem>
                        <SelectItem value="5">5 (Highest)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="estimatedCompletion">Estimated Completion</Label>
                    <Input
                      id="estimatedCompletion"
                      type="date"
                      value={formData.estimatedCompletion}
                      onChange={(e) => setFormData({ ...formData, estimatedCompletion: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g. mobile, performance, ui"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assignedTo">Assigned To (optional)</Label>
                  <Input
                    id="assignedTo"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    placeholder="Team member name or ID"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Item</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="planned">Planned</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="on-hold">On Hold</TabsTrigger>
        </TabsList>

        {["all", "planned", "in-progress", "completed", "on-hold"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {roadmapItems
              .filter((item) => tab === "all" || item.status === tab)
              .map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{item.title}</CardTitle>
                      <Badge className={getStatusColor(item.status)}>{item.status.replace("-", " ")}</Badge>
                    </div>
                    <CardDescription>
                      Priority: {item.priority} • Category: {item.category.replace("-", " ")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="line-clamp-2">{item.description}</p>

                    {item.relatedFeedbackIds.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">
                          {item.relatedFeedbackIds.length} related feedback items
                        </span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditItem(item)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleLinkFeedback(item)}>
                        <LinkIcon className="h-4 w-4 mr-1" />
                        Link Feedback
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}

            {roadmapItems.filter((item) => tab === "all" || item.status === tab).length === 0 && (
              <div className="text-center py-8 text-gray-500">No roadmap items found</div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Roadmap Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as RoadmapStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as RoadmapCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="enhancement">Enhancement</SelectItem>
                      <SelectItem value="bug-fix">Bug Fix</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="ui-ux">UI/UX</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-priority">Priority (1-5)</Label>
                  <Select
                    value={formData.priority.toString()}
                    onValueChange={(value) => setFormData({ ...formData, priority: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 (Lowest)</SelectItem>
                      <SelectItem value="2">2 (Low)</SelectItem>
                      <SelectItem value="3">3 (Medium)</SelectItem>
                      <SelectItem value="4">4 (High)</SelectItem>
                      <SelectItem value="5">5 (Highest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-estimatedCompletion">Estimated Completion</Label>
                  <Input
                    id="edit-estimatedCompletion"
                    type="date"
                    value={formData.estimatedCompletion}
                    onChange={(e) => setFormData({ ...formData, estimatedCompletion: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                <Input
                  id="edit-tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g. mobile, performance, ui"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-assignedTo">Assigned To (optional)</Label>
                <Input
                  id="edit-assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="Team member name or ID"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Link Feedback Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Link Feedback to Roadmap Item</DialogTitle>
            <DialogDescription>
              Connect user feedback to this roadmap item to show which suggestions are being implemented.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <h3 className="font-medium">Roadmap Item: {selectedItem?.title}</h3>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {feedbackItems.map((feedback) => (
                <div key={feedback.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`feedback-${feedback.id}`}
                    checked={selectedFeedbackIds.includes(feedback.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFeedbackIds([...selectedFeedbackIds, feedback.id])
                      } else {
                        setSelectedFeedbackIds(selectedFeedbackIds.filter((id) => id !== feedback.id))
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor={`feedback-${feedback.id}`} className="flex-1 text-sm">
                    {feedback.title}
                    <span className="ml-2 text-xs text-gray-500">({feedback.votes} votes)</span>
                  </label>
                </div>
              ))}

              {feedbackItems.length === 0 && (
                <div className="text-center py-4 text-gray-500">No feedback items available</div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLinkSubmit}>Link Selected Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
