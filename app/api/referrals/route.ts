import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const { referrer_id, referred_email } = await request.json()

    if (!referrer_id || !referred_email) {
      return NextResponse.json({ error: "Referrer ID and referred email are required" }, { status: 400 })
    }

    // Generate a unique referral code
    const referralCode = `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

    // Store the referral in the database
    const { data, error } = await supabase
      .from("referrals")
      .insert([
        {
          referrer_id,
          referred_email,
          referral_code: referralCode,
          status: "pending",
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // In a real implementation, you would send an email to the referred user
    // with a link containing the referral code

    return NextResponse.json(
      {
        referral: data,
        referralCode,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating referral:", error)
    return NextResponse.json({ error: "Failed to create referral" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const url = new URL(request.url)
  const userId = url.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from("referrals")
      .select(`
        *,
        referrer:referrer_id (id, username, avatar_url),
        referred:referred_id (id, username, avatar_url)
      `)
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ referrals: data })
  } catch (error) {
    console.error("Error fetching referrals:", error)
    return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 })
  }
}
