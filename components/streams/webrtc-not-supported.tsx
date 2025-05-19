import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function WebRTCNotSupported() {
  return (
    <Card className="border-yellow-500">
      <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <CardTitle>Browser Not Supported</CardTitle>
        </div>
        <CardDescription>Your browser doesn't fully support the technologies needed for live streaming</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="mb-4">To watch live streams, please use one of these supported browsers:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Google Chrome (version 80 or newer)</li>
          <li>Mozilla Firefox (version 76 or newer)</li>
          <li>Microsoft Edge (version 80 or newer)</li>
          <li>Safari (version 13 or newer)</li>
        </ul>
      </CardContent>
    </Card>
  )
}
