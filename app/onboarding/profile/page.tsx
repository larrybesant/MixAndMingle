import { ProfileCompletion } from "@/components/profile-completion"

export const metadata = {
  title: "Complete Your Profile | Mix & Mingle",
  description: "Set up your Mix & Mingle profile",
}

export default function ProfileCompletionPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome to Mix & Mingle</h1>
      <ProfileCompletion />
    </div>
  )
}
