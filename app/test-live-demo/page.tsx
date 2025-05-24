import TestExecutionDemo from "@/components/auth/test-execution-demo"

export default function LiveTestDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🔥 LIVE TEST EXECUTION</h1>
          <p className="text-xl text-gray-600">
            Watch the automated signup test execute in real-time with detailed monitoring
          </p>
          <div className="mt-4 text-sm text-gray-500">
            The test will start automatically and create a real Firebase account
          </div>
        </div>
        <TestExecutionDemo />
      </div>
    </div>
  )
}
