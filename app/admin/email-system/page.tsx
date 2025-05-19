import { getServerCookies } from "@/app/lib/server-utils"
import { EmailTestForm } from "./email-test-form"
import { EmailLogs } from "./email-logs"

export default async function EmailSystemPage() {
  // Use the server utils instead of direct imports
  const cookieStore = getServerCookies()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Email System</h1>

      <div className="grid gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Emails</h2>
          <EmailTestForm />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Email Logs</h2>
          <EmailLogs />
        </div>
      </div>
    </div>
  )
}
