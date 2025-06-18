import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirectTo = requestUrl.searchParams.get("redirectTo") || "/dashboard"

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth callback error:", error)
        return NextResponse.redirect(new URL("/login?error=auth_error", requestUrl.origin))
      }

      if (data.user) {
        // Check if profile exists, if not redirect to setup
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

        if (!profile) {
          return NextResponse.redirect(new URL("/setup-profile", requestUrl.origin))
        }

        return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
      }
    } catch (error) {
      console.error("Unexpected auth error:", error)
      return NextResponse.redirect(new URL("/login?error=unexpected_error", requestUrl.origin))
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL("/login?error=no_code", requestUrl.origin))
}

// Add POST method support for webhooks
export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    const body = await request.json()

    // Handle Supabase webhook events
    if (body.type === "INSERT" && body.table === "auth.users") {
      // Auto-create profile for new user
      const { data: user } = body.record

      if (user) {
        await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          username: user.email?.split("@")[0] || "user",
          created_at: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 })
  }
}
