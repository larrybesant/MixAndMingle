export default function AdminTestPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Test Page</h1>
      <p className="mb-4">If you can see this page, you have admin access!</p>

      <div className="p-4 bg-green-100 border border-green-300 rounded-md">
        <p className="text-green-800">Success! Your admin privileges are working correctly.</p>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Try these admin pages:</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <a href="/admin/dashboard" className="text-blue-600 hover:underline">
              Admin Dashboard
            </a>
          </li>
          <li>
            <a href="/admin/email-system" className="text-blue-600 hover:underline">
              Email System
            </a>
          </li>
          <li>
            <a href="/admin/setup-notifications" className="text-blue-600 hover:underline">
              Setup Notifications
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}
