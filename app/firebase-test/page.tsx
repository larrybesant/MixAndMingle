import FirebasePolyfillTest from "@/components/firebase-polyfill-test"
import FirebaseConfigChecker from "@/components/firebase-config-checker"

export default function FirebaseTestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Firebase Functionality Test</h1>
      <p className="mb-8">
        This page tests whether Firebase is working correctly with the Node.js polyfills. First, check your Firebase
        configuration status, then run the tests to verify functionality.
      </p>

      <div className="mb-8">
        <FirebaseConfigChecker />
      </div>

      <FirebasePolyfillTest />

      <div className="mt-12 bg-gray-100 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting Tips</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>If authentication tests fail, check that your Firebase project has anonymous auth enabled.</li>
          <li>If Firestore tests fail, verify that your Firestore security rules allow test operations.</li>
          <li>If Storage tests fail, check your Storage security rules and CORS configuration.</li>
          <li>Check the browser console for additional error details.</li>
          <li>Ensure all required Node.js polyfills are properly configured in next.config.js.</li>
        </ul>
      </div>
    </div>
  )
}
