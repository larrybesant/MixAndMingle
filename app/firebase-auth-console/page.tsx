import FirebaseAuthConsole from "@/components/auth/firebase-auth-console"

export default function FirebaseAuthConsolePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🔐 Firebase Authentication Console</h1>
          <p className="text-xl text-gray-600">
            Direct access to view all authenticated users in your Firebase project
          </p>
        </div>
        <FirebaseAuthConsole />
      </div>
    </div>
  )
}
