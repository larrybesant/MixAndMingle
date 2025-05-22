import { ApiTest } from "@/components/api-test"

export default function ApiTestPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">API Connection Test</h1>

        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">API Configuration</h2>
          <p className="text-blue-700 mb-4">Make sure you have the following environment variables set up:</p>
          <ul className="list-disc pl-5 text-blue-700 space-y-1">
            <li>
              <code>NEXT_PUBLIC_API_URL</code> - Your API URL (e.g., https://djmixandmingle.com/api)
            </li>
            <li>
              <code>NEXT_PUBLIC_APP_URL</code> - Your application URL
            </li>
          </ul>
        </div>

        <ApiTest />
      </div>
    </div>
  )
}
