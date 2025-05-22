import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Mock data for system alerts
const systemAlerts = [
  {
    id: "1",
    type: "error",
    title: "Database Connection Error",
    description: "Failed to connect to the database at 2023-05-20 14:30:45",
    timestamp: "2023-05-20T14:30:45Z",
  },
  {
    id: "2",
    type: "warning",
    title: "High Server Load",
    description: "Server load exceeded 80% for more than 5 minutes",
    timestamp: "2023-05-20T12:15:30Z",
  },
  {
    id: "3",
    type: "success",
    title: "Backup Completed",
    description: "Daily backup completed successfully",
    timestamp: "2023-05-20T04:00:12Z",
  },
  {
    id: "4",
    type: "info",
    title: "System Update",
    description: "System will be updated to version 2.5.0 tonight at 02:00 AM",
    timestamp: "2023-05-19T18:45:00Z",
  },
]

export default function AdminAlerts() {
  return (
    <div className="space-y-4">
      {systemAlerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={
            alert.type === "error"
              ? "destructive"
              : alert.type === "warning"
                ? "default"
                : alert.type === "success"
                  ? "default"
                  : "outline"
          }
          className={
            alert.type === "success"
              ? "border-green-500 bg-green-50"
              : alert.type === "info"
                ? "border-blue-500 bg-blue-50"
                : undefined
          }
        >
          {alert.type === "error" && <AlertCircle className="h-4 w-4" />}
          {alert.type === "warning" && <AlertTriangle className="h-4 w-4" />}
          {alert.type === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
          {alert.type === "info" && <Info className="h-4 w-4 text-blue-500" />}
          <AlertTitle
            className={
              alert.type === "success" ? "text-green-800" : alert.type === "info" ? "text-blue-800" : undefined
            }
          >
            {alert.title}
          </AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span
              className={
                alert.type === "success" ? "text-green-700" : alert.type === "info" ? "text-blue-700" : undefined
              }
            >
              {alert.description}
            </span>
            <span className="text-xs text-muted-foreground">{new Date(alert.timestamp).toLocaleTimeString()}</span>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
