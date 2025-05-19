import { PaymentHistory } from "@/components/payment-history"

export default function PaymentsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Payments</h1>
      <PaymentHistory />
    </div>
  )
}
