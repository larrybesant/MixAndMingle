export default function EmailTestPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Email Test Page</h1>
      <p className="mb-4">This is a minimal email test page with no dependencies.</p>

      <div className="p-4 bg-green-100 border border-green-300 rounded-md">
        <p className="text-green-800">Success! You can access this minimal email test page.</p>
      </div>

      <div className="mt-6">
        <a href="/admin" className="text-blue-600 hover:underline">
          &larr; Back to Admin Dashboard
        </a>
      </div>
    </div>
  )
}
