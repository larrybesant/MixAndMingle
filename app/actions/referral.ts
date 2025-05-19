"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createReferral(formData: FormData) {
  const referrerId = formData.get("referrerId") as string
  const email = formData.get("email") as string

  if (!referrerId || !email) {
    return {
      error: "Referrer ID and email are required",
    }
  }

  const supabase = createServerClient()

  // Generate a unique referral code
  const referralCode = `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

  // Create a new referral
  const { data, error } = await supabase
    .from("referrals")
    .insert([
      {
        referrer_id: referrerId,
        referred_email: email,
        referral_code: referralCode,
        status: "pending",
      },
    ])
    .select()
    .single()

  if (error) {
    return {
      error: error.message,
    }
  }

  // In a real implementation, you would send an email to the referred user
  // with a link containing the referral code

  revalidatePath("/referrals")

  return {
    success: true,
    referral: data,
    referralCode,
  }
}

export async function processReferralReward(referralId: string) {
  const supabase = createServerClient()

  // Get the referral
  const { data: referral, error: referralError } = await supabase
    .from("referrals")
    .select("*")
    .eq("id", referralId)
    .single()

  if (referralError || !referral) {
    return {
      error: referralError?.message || "Referral not found",
    }
  }

  // Check if the referral is already converted
  if (referral.status === "converted") {
    return {
      error: "Referral already converted",
    }
  }

  // Update the referral status
  const { error: updateError } = await supabase
    .from("referrals")
    .update({
      status: "converted",
      converted_at: new Date().toISOString(),
    })
    .eq("id", referralId)

  if (updateError) {
    return {
      error: updateError.message,
    }
  }

  // Create a payment record for the referral reward
  const { error: paymentError } = await supabase.from("payments").insert([
    {
      sender_id: "system", // You might want to create a system user for this
      recipient_id: referral.referrer_id,
      amount: 1.0, // $1 reward
      currency: "USD",
      status: "completed",
      payment_type: "referral_reward",
      description: "Referral reward",
    },
  ])

  if (paymentError) {
    return {
      error: paymentError.message,
    }
  }

  revalidatePath("/referrals")

  return {
    success: true,
  }
}
