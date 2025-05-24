import GuidedSignupTest from "@/components/auth/guided-signup-test"

export default function GuidedSignupTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 Guided Signup Test Execution</h1>
          <p className="text-gray-600">
            Automated comprehensive testing with real-time progress tracking and detailed validation
          </p>
        </div>
        <GuidedSignupTest />
      </div>
    </div>
  )
}
