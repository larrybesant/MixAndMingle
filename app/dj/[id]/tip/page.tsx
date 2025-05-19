import { createServerClient } from "@/lib/supabase/server"
import { TipDJForm } from "@/components/tip-dj-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { notFound } from "next/navigation"

export default async function TipDJPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()

  // Get DJ profile
  const { data: dj } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      avatar_url,
      bio,
      dj_profiles (
        bio,
        experience,
        genres
      )
    `)
    .eq("id", params.id)
    .single()

  if (!dj) {
    notFound()
  }

  return (
    <div className="container max-w-md py-8">
      <Card>
        <CardHeader>
          <CardTitle>Tip {dj.username}</CardTitle>
          <CardDescription>Show your appreciation by sending a tip to support {dj.username}'s music</CardDescription>
        </CardHeader>
        <CardContent>
          <TipDJForm djId={dj.id} djName={dj.username} />
        </CardContent>
      </Card>
    </div>
  )
}
