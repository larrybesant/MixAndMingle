import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verify webhook signature if needed
    const signature = request.headers.get("x-supabase-signature")

    // Handle different webhook events
    switch (body.type) {
      case "INSERT":
        if (body.table === "auth.users") {
          // Auto-create profile for new user
          const user = body.record
          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            username: user.email?.split("@")[0] || "user",
            full_name: user.user_metadata?.full_name || "",
            avatar_url: user.user_metadata?.avatar_url || "",
            created_at: new Date().toISOString(),
          })
        }
        break

      case "UPDATE":
        // Handle user updates
        break

      case "DELETE":
        // Handle user deletions
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Supabase webhook error:", error)
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 })
  }
}
