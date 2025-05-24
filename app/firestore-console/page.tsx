import FirestoreConsoleViewer from "@/components/auth/firestore-console-viewer"

export default function FirestoreConsolePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🗄️ Firestore Database Console</h1>
          <p className="text-xl text-gray-600">View complete user profile data and document structure in Firestore</p>
        </div>
        <FirestoreConsoleViewer />
      </div>
    </div>
  )
}
