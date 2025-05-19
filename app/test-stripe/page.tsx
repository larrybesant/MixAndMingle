import { createServerClient } from "@/lib/supabase/server"
import { TipDJForm } from "@/components/tip-dj-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function TestStripePage() {
  const supabase = createServerClient()

  // Get the first DJ from the database for testing
  const { data: djs } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      dj_profiles!inner (id)
    `)
    .limit(1)

  if (!djs || djs.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">No DJs found</h1>
        <p>Please create a DJ profile first to test the tipping functionality.</p>
      </div>
    )
  }

  return (
    <div className="container max-w-md py-8">
      <Card>
        <CardHeader>
          <CardTitle>Test Stripe Integration</CardTitle>
          <CardDescription>
            Use test card number: 4242 4242 4242 4242 with any future expiration date, any 3-digit CVC, and any postal
            code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TipDJForm djId={djs[0].id} djName={djs[0].username} />
        </CardContent>
      </Card>
    </div>
  )
}
