import { BetaRegistrationForm } from "@/components/beta-registration-form"

export const metadata = {
  title: "Beta Registration | Mix & Mingle",
  description: "Register for the Mix & Mingle beta program with your invitation code",
}

export default function BetaRegistrationPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Beta Registration</h1>
        <BetaRegistrationForm />
      </div>
    </div>
  )
}
