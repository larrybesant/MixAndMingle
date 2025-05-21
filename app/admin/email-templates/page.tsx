import type { Metadata } from "next"
import { EmailTemplatePreview } from "@/components/admin/email-template-preview"

export const metadata: Metadata = {
  title: "Email Templates | Mix & Mingle Admin",
  description: "Preview and manage email templates for beta communications",
}

export default function EmailTemplatesPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Email Templates</h1>
      <EmailTemplatePreview />
    </div>
  )
}
