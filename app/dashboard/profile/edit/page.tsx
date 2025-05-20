import { ProfileEditor } from "@/components/profile-editor"

export const metadata = {
  title: "Edit Profile | Mix & Mingle",
  description: "Edit your Mix & Mingle profile",
}

export default function EditProfilePage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Your Profile</h1>
      <ProfileEditor />
    </div>
  )
}
