import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center mb-6">About Mix & Mingle</h1>

        <p className="mb-4">
          Mix & Mingle is a social networking platform that allows users to connect through chat rooms, video calls, and
          more.
        </p>

        <p className="mb-6">This is a minimal version created for testing deployment issues.</p>

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
