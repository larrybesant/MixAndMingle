import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CarProps {
  make: string
  model: string
  year: number
  color?: string
  image?: string
  description?: string
  className?: string
}

export default function Car({ make, model, year, color = "Unknown", image, description, className }: CarProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        {image && (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={image || "/placeholder.svg"}
              alt={`${year} ${make} ${model}`}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <h3 className="text-2xl font-bold">
            {year} {make} {model}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Color: {color}</p>
          {description && <p className="mt-4 text-sm">{description}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
