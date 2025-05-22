import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react"

interface AdminStatsCardProps {
  title: string
  value: string
  description: string
  icon: LucideIcon
  trend: "up" | "down" | "neutral"
}

export default function AdminStatsCard({ title, value, description, icon: Icon, trend }: AdminStatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          {trend === "up" && <ArrowUp className="mr-1 h-4 w-4 text-green-500" />}
          {trend === "down" && <ArrowDown className="mr-1 h-4 w-4 text-red-500" />}
          <span className={trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : ""}>
            {description}
          </span>
        </p>
      </CardContent>
    </Card>
  )
}
