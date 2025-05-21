import { FirebaseOptimizedExample } from "@/components/firebase-optimized-example"

export const metadata = {
  title: "Optimized Firebase Example",
  description: "Example of using Firebase with dynamic imports for better performance",
}

export default function FirebaseOptimizedPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Optimized Firebase Implementation</h1>
      <p className="text-center mb-8 text-muted-foreground">
        This example demonstrates using Firebase with dynamic imports to reduce bundle size
      </p>

      <FirebaseOptimizedExample />

      <div className="mt-10 p-6 bg-muted rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Bundle Size Benefits</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>Firebase modules are only loaded when they're actually used</li>
          <li>Initial page load is faster because Firebase code is split into chunks</li>
          <li>Authentication, Firestore, and Storage are loaded independently</li>
          <li>Analytics and Messaging are only loaded in the browser</li>
          <li>Error handling is centralized and consistent</li>
        </ul>
      </div>
    </div>
  )
}
