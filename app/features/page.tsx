import Link from "next/link"

export default function FeaturesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center mb-6">Features</h1>

        <ul className="space-y-2 mb-6">
          <li className="flex items-center">
            <span className="mr-2">✅</span>
            <span>Chat Rooms</span>
          </li>
          <li className="flex items-center">
            <span className="mr-2">✅</span>
            <span>Video Rooms</span>
          </li>
          <li className="flex items-center">
            <span className="mr-2">✅</span>
            <span>User Profiles</span>
          </li>
          <li className="flex items-center">
            <span className="mr-2">✅</span>
            <span>Virtual Gifts</span>
          </li>
        </ul>

        <Link
          href="/"
          className="block w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 text-center rounded-md dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
