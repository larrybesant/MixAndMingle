export default function EmailSystemPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Email System</h1>

      <div className="p-4 bg-green-100 border border-green-300 rounded-md">
        <p className="text-green-800">Success! You can access the Email System page.</p>
      </div>

      <div className="mt-6">
        <p className="mb-4">
          This is a simplified version of the Email System page. The full implementation would include:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Email testing functionality</li>
          <li>Email logs viewer</li>
          <li>Email template management</li>
        </ul>
      </div>

      <div className="mt-6">
        <a href="/admin/dashboard" className="text-blue-600 hover:underline">
          &larr; Back to Admin Dashboard
        </a>
      </div>
    </div>
  )
}
