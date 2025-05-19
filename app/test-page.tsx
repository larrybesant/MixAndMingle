export default function TestPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Test Page</h1>
      <p className="mb-4">If you can see this page, basic routing is working!</p>

      <div className="p-4 bg-green-100 border border-green-300 rounded-md">
        <p className="text-green-800">Success! This test page is accessible.</p>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Try these admin pages:</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <a href="/admin-test" className="text-blue-600 hover:underline">
              Admin Test Page
            </a>
          </li>
          <li>
            <a href="/admin" className="text-blue-600 hover:underline">
              Admin Dashboard
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}
