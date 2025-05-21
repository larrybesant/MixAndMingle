import { ErrorHandlingDemo } from "@/components/error-handling-demo"

export default function ErrorHandlingDemoPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Firebase Error Handling Demo</h1>
      <p className="text-center text-muted-foreground mb-8">
        This page demonstrates the robust error handling system for Firebase operations
      </p>

      <ErrorHandlingDemo />

      <div className="mt-10 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <p className="mb-4">This demo showcases our comprehensive error handling system for Firebase operations:</p>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Centralized error handling with user-friendly messages</li>
          <li>Error categorization by severity (info, warning, error, critical)</li>
          <li>Automatic retry for transient errors</li>
          <li>Detailed error logging for debugging</li>
          <li>Context-aware error handling</li>
        </ul>

        <h2 className="text-xl font-semibold mb-4">Best Practices</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Always wrap Firebase operations in try/catch blocks</li>
          <li>Use the provided hooks and wrappers for consistent error handling</li>
          <li>Include context information when handling errors</li>
          <li>Consider using retry mechanisms for network operations</li>
          <li>Provide clear feedback to users when errors occur</li>
        </ul>
      </div>
    </div>
  )
}
