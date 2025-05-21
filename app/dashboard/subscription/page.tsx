import { LazySubscriptionPlans } from "@/components/lazy"

export default function SubscriptionPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Subscription Plans</h1>
      <LazySubscriptionPlans />
    </div>
  )
}
