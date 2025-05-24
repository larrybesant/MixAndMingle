import SignupTest from "@/components/auth/signup-test"

export default function TestSignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Signup & Firestore Test</h1>
          <p className="text-gray-600">Comprehensive testing of account creation and Firestore document verification</p>
        </div>
        <SignupTest />
      </div>
    </div>
  )
}
