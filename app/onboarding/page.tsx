import { ABTestOnboarding } from "@/components/onboarding/ab-test-onboarding"

export const metadata = {
  title: "Get Started | Mix & Mingle",
  description: "Complete your onboarding to start using Mix & Mingle",
}

export default function OnboardingPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <ABTestOnboarding />
    </div>
  )
}
