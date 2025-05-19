import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import DjProfileForm from "@/components/dj/dj-profile-form"
import { getDjProfile } from "@/app/actions/dj-profiles"

export default async function DjProfilePage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/signin?callbackUrl=/dj-profile")
  }

  // Get DJ profile if it exists
  const profile = await getDjProfile(user.id)

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-pink-500">
        DJ Profile
      </h1>

      <DjProfileForm profile={profile} />
    </div>
  )
}
