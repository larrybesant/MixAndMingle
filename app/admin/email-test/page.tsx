import { EmailTestForm } from "@/components/email-test-form"

export default function EmailTestPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">SendGrid Email Test</h1>

        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">SendGrid Configuration</h2>
          <p className="text-blue-700 mb-4">Make sure you have the following environment variables set up:</p>
          <ul className="list-disc pl-5 text-blue-700 space-y-1">
            <li>
              <code>SENDGRID_API_KEY</code> - Your SendGrid API key
            </li>
            <li>
              <code>EMAIL_FROM</code> - The email address to send from (must be verified in SendGrid)
            </li>
            <li>
              <code>NEXT_PUBLIC_APP_URL</code> - Your application URL for email links
            </li>
          </ul>
        </div>

        <EmailTestForm />
      </div>
    </div>
  )
}
