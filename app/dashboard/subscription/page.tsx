import { SubscriptionPlans } from "@/components/subscription-plans"

export default function SubscriptionPage() {
  return (
    <div className="flex flex-col gap-6 py-6">
      <h1 className="text-3xl font-bold">Subscription</h1>
      <p className="text-muted-foreground">
        Choose the perfect subscription plan to enhance your Mix & Mingle experience.
      </p>
      <SubscriptionPlans />
    </div>
  )
}
