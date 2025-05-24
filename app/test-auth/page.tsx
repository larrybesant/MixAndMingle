import AuthTest from "@/components/auth/auth-test"

export default function TestAuthPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Authentication Test Suite</h1>
          <p className="text-gray-600">Comprehensive testing of Firebase authentication and user data integration</p>
        </div>
        <AuthTest />
      </div>
    </div>
  )
}
