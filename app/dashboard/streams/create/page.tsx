"use client"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { CreateStreamForm } from "@/components/create-stream-form"

export default function CreateStreamPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create a New Stream</h1>
      <CreateStreamForm user={user} router={router} toast={toast} />
    </div>
  )
}
