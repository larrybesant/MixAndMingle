import { NotificationTester } from "@/components/notification-tester"

export default function NotificationTestPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Notification Test</h1>
      <p className="text-muted-foreground">Use this page to test sending notifications to yourself.</p>

      <NotificationTester />
    </div>
  )
}
