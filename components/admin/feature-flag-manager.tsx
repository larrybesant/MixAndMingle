/**
 * Feature Flag Manager
 *
 * Admin interface for managing feature flags
 */

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { featureFlagService } from "@/lib/feature-flags/feature-flag-service"
import type { FeatureFlag, FeatureStatus, BetaGroup } from "@/lib/feature-flags/types"
import { Plus, Edit, Trash } from "lucide-react"

export function FeatureFlagManager() {
  const [features, setFeatures] = useState<FeatureFlag[]>([])
  const [betaGroups, setBetaGroups] = useState<BetaGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingFeature, setEditingFeature] = useState<FeatureFlag | null>(null)

  // Load features and beta groups
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [allFeatures, allBetaGroups] = await Promise.all([
          featureFlagService.getAllFeatures(),
          featureFlagService.getAllBetaGroups(),
        ])
        setFeatures(allFeatures)
        setBetaGroups(allBetaGroups)
      } catch (error) {
        console.error("Error loading feature flags:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Handle adding a new feature
  const handleAddFeature = () => {
    setEditingFeature(null)
    setShowAddDialog(true)
  }

  // Handle editing a feature
  const handleEditFeature = (feature: FeatureFlag) => {
    setEditingFeature(feature)
    setShowAddDialog(true)
  }

  // Handle deleting a feature
  const handleDeleteFeature = async (featureId: string) => {
    if (!confirm("Are you sure you want to delete this feature flag?")) {
      return
    }

    try {
      await featureFlagService.deleteFeature(featureId)
      setFeatures(features.filter((f) => f.id !== featureId))
    } catch (error) {
      console.error("Error deleting feature flag:", error)
    }
  }

  // Get badge variant based on feature status
  const getStatusBadge = (status: FeatureStatus) => {
    switch (status) {
      case "enabled":
        return <Badge className="bg-green-500">Enabled</Badge>
      case "disabled":
        return <Badge variant="outline">Disabled</Badge>
      case "beta":
        return <Badge className="bg-blue-500">Beta</Badge>
      case "scheduled":
        return <Badge className="bg-yellow-500">Scheduled</Badge>
      case "percentage":
        return <Badge className="bg-purple-500">Percentage</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Render feature status details
  const renderStatusDetails = (feature: FeatureFlag) => {
    switch (feature.status) {
      case "beta":
        return (
          <div className="text-xs text-muted-foreground">
            {feature.betaGroups?.length ? `${feature.betaGroups.length} groups` : ""}
            {feature.betaGroups?.length && feature.betaUserIds?.length ? ", " : ""}
            {feature.betaUserIds?.length ? `${feature.betaUserIds.length} users` : ""}
          </div>
        )
      case "scheduled":
        return (
          <div className="text-xs text-muted-foreground">
            {feature.scheduledRelease ? new Date(feature.scheduledRelease).toLocaleDateString() : "No date set"}
          </div>
        )
      case "percentage":
        return <div className="text-xs text-muted-foreground">{feature.rolloutPercentage}% of users</div>
      default:
        return null
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center">Loading feature flags...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Feature Flag Management</h1>
        <Button onClick={handleAddFeature}>
          <Plus className="h-4 w-4 mr-2" /> Add Feature Flag
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Features</TabsTrigger>
          <TabsTrigger value="enabled">Enabled</TabsTrigger>
          <TabsTrigger value="beta">Beta</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <FeatureTable
            features={features}
            onEdit={handleEditFeature}
            onDelete={handleDeleteFeature}
            getStatusBadge={getStatusBadge}
            renderStatusDetails={renderStatusDetails}
          />
        </TabsContent>

        <TabsContent value="enabled">
          <FeatureTable
            features={features.filter((f) => f.status === "enabled")}
            onEdit={handleEditFeature}
            onDelete={handleDeleteFeature}
            getStatusBadge={getStatusBadge}
            renderStatusDetails={renderStatusDetails}
          />
        </TabsContent>

        <TabsContent value="beta">
          <FeatureTable
            features={features.filter((f) => f.status === "beta")}
            onEdit={handleEditFeature}
            onDelete={handleDeleteFeature}
            getStatusBadge={getStatusBadge}
            renderStatusDetails={renderStatusDetails}
          />
        </TabsContent>

        <TabsContent value="scheduled">
          <FeatureTable
            features={features.filter((f) => f.status === "scheduled")}
            onEdit={handleEditFeature}
            onDelete={handleDeleteFeature}
            getStatusBadge={getStatusBadge}
            renderStatusDetails={renderStatusDetails}
          />
        </TabsContent>
      </Tabs>

      {showAddDialog && (
        <FeatureFlagDialog
          feature={editingFeature}
          betaGroups={betaGroups}
          onClose={() => setShowAddDialog(false)}
          onSave={(savedFeature) => {
            if (editingFeature) {
              setFeatures(features.map((f) => (f.id === savedFeature.id ? savedFeature : f)))
            } else {
              setFeatures([...features, savedFeature])
            }
            setShowAddDialog(false)
          }}
        />
      )}
    </div>
  )
}

// Feature Table Component
interface FeatureTableProps {
  features: FeatureFlag[]
  onEdit: (feature: FeatureFlag) => void
  onDelete: (featureId: string) => void
  getStatusBadge: (status: FeatureStatus) => React.ReactNode
  renderStatusDetails: (feature: FeatureFlag) => React.ReactNode
}

function FeatureTable({ features, onEdit, onDelete, getStatusBadge, renderStatusDetails }: FeatureTableProps) {
  if (features.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">No feature flags found.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Feature</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Details</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {features.map((feature) => (
          <TableRow key={feature.id}>
            <TableCell>
              <div className="font-medium">{feature.name}</div>
              <div className="text-xs text-muted-foreground">{feature.description}</div>
            </TableCell>
            <TableCell>{getStatusBadge(feature.status)}</TableCell>
            <TableCell>{renderStatusDetails(feature)}</TableCell>
            <TableCell>{new Date(feature.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(feature.updatedAt).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onEdit(feature)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(feature.id)}>
                <Trash className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// Feature Flag Dialog Component
interface FeatureFlagDialogProps {
  feature: FeatureFlag | null
  betaGroups: BetaGroup[]
  onClose: () => void
  onSave: (feature: FeatureFlag) => void
}

function FeatureFlagDialog({ feature, betaGroups, onClose, onSave }: FeatureFlagDialogProps) {
  const [name, setName] = useState(feature?.name || "")
  const [description, setDescription] = useState(feature?.description || "")
  const [status, setStatus] = useState<FeatureStatus>(feature?.status || "disabled")
  const [isABTest, setIsABTest] = useState(feature?.isABTest || false)

  // Beta settings
  const [selectedBetaGroups, setSelectedBetaGroups] = useState<string[]>(feature?.betaGroups || [])
  const [betaUserIds, setBetaUserIds] = useState<string>(feature?.betaUserIds?.join(", ") || "")

  // Percentage settings
  const [rolloutPercentage, setRolloutPercentage] = useState(feature?.rolloutPercentage || 0)

  // Scheduled settings
  const [scheduledDate, setScheduledDate] = useState(
    feature?.scheduledRelease ? new Date(feature.scheduledRelease).toISOString().split("T")[0] : "",
  )

  // A/B test variants
  const [variants, setVariants] = useState(
    feature?.variants || [
      { id: "control", name: "Control", description: "Original version", weight: 50 },
      { id: "variant-a", name: "Variant A", description: "Test version", weight: 50 },
    ],
  )

  const handleSave = async () => {
    try {
      // Prepare feature data
      const featureData: Omit<FeatureFlag, "id" | "createdAt" | "updatedAt"> = {
        name,
        description,
        status,
        isABTest,
        variants: isABTest ? variants : undefined,
        betaGroups: status === "beta" ? selectedBetaGroups : undefined,
        betaUserIds:
          status === "beta"
            ? betaUserIds
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean)
            : undefined,
        rolloutPercentage: status === "percentage" ? rolloutPercentage : undefined,
        scheduledRelease: status === "scheduled" && scheduledDate ? new Date(scheduledDate) : undefined,
      }

      let savedFeature: FeatureFlag

      if (feature) {
        // Update existing feature
        await featureFlagService.updateFeature(feature.id, featureData)
        savedFeature = {
          ...feature,
          ...featureData,
          updatedAt: new Date(),
        }
      } else {
        // Create new feature
        savedFeature = await featureFlagService.createFeature(featureData)
      }

      onSave(savedFeature)
    } catch (error) {
      console.error("Error saving feature flag:", error)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{feature ? "Edit Feature Flag" : "Add Feature Flag"}</DialogTitle>
          <DialogDescription>
            {feature
              ? "Update the settings for this feature flag."
              : "Create a new feature flag to control access to features."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Feature name"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Describe what this feature does"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={status} onValueChange={(value) => setStatus(value as FeatureStatus)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="beta">Beta</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="percentage">Percentage Rollout</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === "beta" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Beta Groups</Label>
                <div className="col-span-3">
                  {betaGroups.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No beta groups available</div>
                  ) : (
                    <div className="space-y-2">
                      {betaGroups.map((group) => (
                        <div key={group.id} className="flex items-center space-x-2">
                          <Switch
                            id={`group-${group.id}`}
                            checked={selectedBetaGroups.includes(group.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedBetaGroups([...selectedBetaGroups, group.id])
                              } else {
                                setSelectedBetaGroups(selectedBetaGroups.filter((id) => id !== group.id))
                              }
                            }}
                          />
                          <Label htmlFor={`group-${group.id}`}>{group.name}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="betaUserIds" className="text-right">
                  Beta User IDs
                </Label>
                <Textarea
                  id="betaUserIds"
                  value={betaUserIds}
                  onChange={(e) => setBetaUserIds(e.target.value)}
                  className="col-span-3"
                  placeholder="Comma-separated list of user IDs"
                />
              </div>
            </>
          )}

          {status === "scheduled" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="scheduledDate" className="text-right">
                Release Date
              </Label>
              <Input
                id="scheduledDate"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="col-span-3"
              />
            </div>
          )}

          {status === "percentage" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rolloutPercentage" className="text-right">
                Rollout Percentage
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="rolloutPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={rolloutPercentage}
                  onChange={(e) => setRolloutPercentage(Number(e.target.value))}
                  className="w-24"
                />
                <span>%</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isABTest" className="text-right">
              A/B Test
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch id="isABTest" checked={isABTest} onCheckedChange={setIsABTest} />
              <Label htmlFor="isABTest">Enable A/B testing for this feature</Label>
            </div>
          </div>

          {isABTest && (
            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right pt-2">Variants</Label>
              <div className="col-span-3 space-y-4">
                {variants.map((variant, index) => (
                  <Card key={variant.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`variant-${index}-name`}>Variant Name</Label>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`variant-${index}-weight`}>Weight</Label>
                          <Input
                            id={`variant-${index}-weight`}
                            type="number"
                            min="1"
                            max="99"
                            value={variant.weight}
                            onChange={(e) => {
                              const newVariants = [...variants]
                              newVariants[index].weight = Number(e.target.value)
                              setVariants(newVariants)
                            }}
                            className="w-20"
                          />
                          <span>%</span>
                        </div>
                      </div>
                      <Input
                        id={`variant-${index}-name`}
                        value={variant.name}
                        onChange={(e) => {
                          const newVariants = [...variants]
                          newVariants[index].name = e.target.value
                          setVariants(newVariants)
                        }}
                        placeholder="Variant name"
                      />
                      <Input
                        id={`variant-${index}-description`}
                        value={variant.description}
                        onChange={(e) => {
                          const newVariants = [...variants]
                          newVariants[index].description = e.target.value
                          setVariants(newVariants)
                        }}
                        placeholder="Variant description"
                      />
                    </div>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const newVariant = {
                      id: `variant-${variants.length}`,
                      name: `Variant ${variants.length}`,
                      description: "",
                      weight: Math.floor(100 / (variants.length + 1)),
                    }

                    // Adjust weights to ensure they sum to 100%
                    const newVariants = variants.map((v) => ({
                      ...v,
                      weight: Math.floor((v.weight * (100 - newVariant.weight)) / 100),
                    }))

                    setVariants([...newVariants, newVariant])
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Variant
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{feature ? "Update" : "Create"} Feature Flag</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
