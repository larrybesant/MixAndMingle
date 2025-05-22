import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, Users, CalendarDays, MessageSquare, Bell, AlertTriangle } from "lucide-react"
import AdminStatsCard from "./components/admin-stats-card"
import AdminRecentUsers from "./components/admin-recent-users"
import AdminRecentEvents from "./components/admin-recent-events"
import AdminAlerts from "./components/admin-alerts"

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your Mix & Mingle application</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatsCard title="Total Users" value="3,721" description="+12% from last month" icon={Users} trend="up" />
        <AdminStatsCard
          title="Active Events"
          value="254"
          description="+5% from last month"
          icon={CalendarDays}
          trend="up"
        />
        <AdminStatsCard
          title="Messages"
          value="8,294"
          description="+18% from last month"
          icon={MessageSquare}
          trend="up"
        />
        <AdminStatsCard title="Alerts" value="12" description="-3% from last month" icon={AlertTriangle} trend="down" />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>New users who joined in the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminRecentUsers />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Events created in the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminRecentEvents />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Recent alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminAlerts />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Card className="cursor-pointer hover:bg-gray-50">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <Users className="h-8 w-8 mb-2 text-blue-500" />
                      <p className="text-sm font-medium">Manage Users</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:bg-gray-50">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <CalendarDays className="h-8 w-8 mb-2 text-green-500" />
                      <p className="text-sm font-medium">Create Event</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:bg-gray-50">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <Bell className="h-8 w-8 mb-2 text-yellow-500" />
                      <p className="text-sm font-medium">Send Notification</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:bg-gray-50">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <ArrowUpRight className="h-8 w-8 mb-2 text-purple-500" />
                      <p className="text-sm font-medium">View Reports</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Detailed analytics and metrics for your application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Analytics dashboard will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and view reports for your application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Reports dashboard will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage and send notifications to users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Notifications dashboard will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
