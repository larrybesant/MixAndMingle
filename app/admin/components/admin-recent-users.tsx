import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Mock data for recent users
const recentUsers = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "/abstract-geometric-shapes.png",
    status: "active",
    joinedAt: "2023-05-20T10:30:00Z",
  },
  {
    id: "2",
    name: "Samantha Lee",
    email: "samantha@example.com",
    avatar: "/number-two-graphic.png",
    status: "active",
    joinedAt: "2023-05-19T14:45:00Z",
  },
  {
    id: "3",
    name: "Michael Chen",
    email: "michael@example.com",
    avatar: "/abstract-geometric-shapes.png",
    status: "pending",
    joinedAt: "2023-05-18T09:15:00Z",
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    email: "emily@example.com",
    avatar: "/abstract-geometric-shapes.png",
    status: "active",
    joinedAt: "2023-05-17T16:20:00Z",
  },
  {
    id: "5",
    name: "David Kim",
    email: "david@example.com",
    avatar: "/abstract-geometric-composition-5.png",
    status: "inactive",
    joinedAt: "2023-05-16T11:10:00Z",
  },
]

export default function AdminRecentUsers() {
  return (
    <div className="space-y-4">
      {recentUsers.map((user) => (
        <div key={user.id} className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={user.status === "active" ? "default" : user.status === "pending" ? "outline" : "secondary"}>
              {user.status}
            </Badge>
            <span className="text-xs text-muted-foreground">{new Date(user.joinedAt).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
