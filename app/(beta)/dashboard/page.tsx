import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mix & Mingle Beta - Dashboard",
  description: "Welcome to the Mix & Mingle beta program",
}

export default function BetaDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to the Mix & Mingle Beta!</h1>
          <p className="text-lg opacity-90">
            You're among the first to experience our new platform. Thank you for being part of our journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">
                  1
                </span>
                <span>Create your DJ profile</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">
                  2
                </span>
                <span>Join a live DJ room</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">
                  3
                </span>
                <span>Create your first playlist</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Beta Features</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-2">•</span>
                <span>Live DJ streaming</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-2">•</span>
                <span>Real-time chat with other listeners</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-2">•</span>
                <span>Collaborative playlists</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-2">•</span>
                <span>DJ popularity leaderboard</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Feedback</h2>
          <p className="mb-4">
            Your feedback is crucial to help us improve. Please report any bugs or share your suggestions.
          </p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">Submit Feedback</button>
        </div>
      </div>
    </div>
  )
}
