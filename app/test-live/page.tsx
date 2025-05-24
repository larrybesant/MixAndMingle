import LiveTestExecution from "@/components/auth/live-test-execution"

export default function LiveTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔥 Live Test Execution Monitor</h1>
          <p className="text-gray-600">
            Real-time automated signup testing with detailed monitoring, performance metrics, and live execution logs
          </p>
        </div>
        <LiveTestExecution />
      </div>
    </div>
  )
}
