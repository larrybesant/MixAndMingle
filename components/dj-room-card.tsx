import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

interface DJRoomProps {
  id: string
  title: string
  dj: string
  viewers: number
  isLive?: boolean
  imageUrl?: string
}

export function DJRoomCard({ id, title, dj, viewers, isLive = true, imageUrl }: DJRoomProps) {
  return (
    <Link href={`/room/${id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-purple-900 to-black">
          {/* Image with fallback */}
          <Image
            src={imageUrl || `/placeholder.svg?height=200&width=400&query=dj+music+${encodeURIComponent(title || "")}`}
            alt={title || "DJ Room"}
            fill
            className="object-cover transition-transform hover:scale-105"
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.target as HTMLImageElement
              target.src = `/placeholder.svg?height=200&width=400&query=dj+music`
            }}
          />

          {/* Live indicator */}
          {isLive && (
            <Badge variant="destructive" className="absolute top-2 left-2 bg-red-500 px-2 py-1">
              LIVE
            </Badge>
          )}

          {/* Viewer count */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
            <Users className="h-3 w-3" />
            <span>{viewers.toLocaleString()}</span>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-bold line-clamp-1">{title || "Untitled Room"}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{dj || "Anonymous DJ"}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
