# .gitignore
node_modules/
.next/
.env*
out/
build/
.DS_Store
.vercel/
*.log
*.tsbuildinfo
some-big-repo.git/

"use client"

import { useParams } from "next/navigation"

export default function ProfilePage() {
  const { username } = useParams()

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Profile: {username}</h1>
      {/* Add profile editing, stats, referral link, etc. here */}
      <p className="text-gray-500">Profile details coming soon.</p>
    </div>
  )
}