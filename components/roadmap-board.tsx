"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, CheckCircle2, Clock, AlertCircle, PauseCircle } from "lucide-react"
import Link from "next/link"
import type { RoadmapItem, RoadmapStatus } from "@/lib/roadmap-service"
import { RoadmapViewSwitcher } from "./roadmap-view-switcher"

interface RoadmapBoardProps {
  plannedItems: RoadmapItem[]
  inProgressItems: RoadmapItem[]
  completedItems: RoadmapItem[]
  onHoldItems: RoadmapItem[]
}

export function RoadmapBoard({ plannedItems, inProgressItems, completedItems, onHoldItems }: RoadmapBoardProps) {
  const [view, setView] = useState<"kanban" | "list">("kanban")

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      feature: "bg-blue-100 text-blue-800",
      enhancement: "bg-green-100 text-green-800",
      "bug-fix": "bg-red-100 text-red-800",
      performance: "bg-purple-100 text-purple-800",
      "ui-ux": "bg-yellow-100 text-yellow-800",
      infrastructure: "bg-gray-100 text-gray-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (status: RoadmapStatus) => {
    switch (status) {
      case "planned":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "in-progress":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "on-hold":
        return <PauseCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const RoadmapCard = ({ item }: { item: RoadmapItem }) => (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
          {getStatusIcon(item.status)}
        </div>
        <CardDescription>
          {item.description.length > 100 ? `${item.description.substring(0, 100)}...` : item.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge className={getCategoryColor(item.category)}>{item.category.replace("-", " ")}</Badge>
          {item.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        {item.estimatedCompletion && (
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <CalendarIcon className="mr-1 h-4 w-4" />
            Est. completion: {new Date(item.estimatedCompletion).toLocaleDateString()}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <div className="text-sm text-gray-500">
          {item.relatedFeedbackIds.length > 0 && <span>{item.relatedFeedbackIds.length} related feedback</span>}
        </div>
        <Link href={`/dashboard/beta/roadmap/${item.id}`}>
          <Button variant="ghost" size="sm">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )

  const StatusColumn = ({ title, items, icon }: { title: string; items: RoadmapItem[]; icon: React.ReactNode }) => (
    <div className="flex-1 min-w-[250px]">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-semibold text-lg">{title}</h3>
        <Badge>{items.length}</Badge>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <RoadmapCard key={item.id} item={item} />
        ))}
        {items.length === 0 && (
          <div className="text-center p-4 border border-dashed rounded-md text-gray-500">No items</div>
        )}
      </div>
    </div>
  )

  const RoadmapList = ({ items }: { items: RoadmapItem[] }) => (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-center p-4 border rounded-lg hover:bg-gray-50">
          <div className="mr-4">{getStatusIcon(item.status)}</div>
          <div className="flex-1">
            <h3 className="font-medium">{item.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getCategoryColor(item.category)}>{item.category.replace("-", " ")}</Badge>
            {item.estimatedCompletion && (
              <div className="text-sm text-gray-500">{new Date(item.estimatedCompletion).toLocaleDateString()}</div>
            )}
            <Link href={`/dashboard/beta/roadmap/${item.id}`}>
              <Button variant="ghost" size="sm">
                Details
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mix & Mingle Roadmap</h2>
        <RoadmapViewSwitcher />
      </div>

      {view === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatusColumn title="Planned" items={plannedItems} icon={<Clock className="h-5 w-5 text-blue-500" />} />
          <StatusColumn
            title="In Progress"
            items={inProgressItems}
            icon={<AlertCircle className="h-5 w-5 text-yellow-500" />}
          />
          <StatusColumn
            title="Completed"
            items={completedItems}
            icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
          />
          <StatusColumn title="On Hold" items={onHoldItems} icon={<PauseCircle className="h-5 w-5 text-gray-500" />} />
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="planned">Planned</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="on-hold">On Hold</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <RoadmapList items={[...plannedItems, ...inProgressItems, ...completedItems, ...onHoldItems]} />
          </TabsContent>
          <TabsContent value="planned">
            <RoadmapList items={plannedItems} />
          </TabsContent>
          <TabsContent value="in-progress">
            <RoadmapList items={inProgressItems} />
          </TabsContent>
          <TabsContent value="completed">
            <RoadmapList items={completedItems} />
          </TabsContent>
          <TabsContent value="on-hold">
            <RoadmapList items={onHoldItems} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
