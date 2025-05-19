import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { markAllNotificationsAsRead } from "../actions/notifications"

export const dynamic = "force-dynamic"

export default async function NotificationsPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/signin")
  }

  // Get notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "event_invitation":
        return "🎉"
      case "event_reminder":
        return "⏰"
      case "new_message":
        return "💬"
      case "stream_starting":
        return "🎵"
      case "friend_request":
        return "👋"
      default:
        return "📣"
    }
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <form action={markAllNotificationsAsRead}>
          <Button type="submit" variant="outline">
            Mark all as read
          </Button>
        </form>
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={notification.is_read ? "" : "border-primary"}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-lg">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{notification.title}</CardTitle>
                    <CardDescription>{formatDate(notification.created_at)}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p>{notification.content}</p>
                {notification.related_id && notification.related_type && (
                  <div className="mt-2">
                    <Button variant="link" className="p-0 h-auto" asChild>
                      <a href={`/${notification.related_type}s/${notification.related_id}`}>
                        View {notification.related_type}
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <h3 className="text-xl font-medium mb-2">No notifications yet</h3>
          <p className="text-muted-foreground">When you receive notifications, they will appear here.</p>
        </div>
      )}
    </div>
  )
}
