"use server"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const username = formData.get("username") as string
  const referralCode = formData.get("referralCode") as string

  if (!email || !password || !username) {
    return {
      error: "Email, password, and username are required",
    }
  }

  const supabase = createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  })

  if (error) {
    return {
      error: error.message,
    }
  }

  if (!user) {
    return {
      error: "User creation failed",
    }
  }

  // Create a profile for the user
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: user.id,
      username,
      email,
    },
  ])

  if (profileError) {
    return {
      error: profileError.message,
    }
  }

  // If a referral code was provided, update the referral
  if (referralCode) {
    const { data: referral, error: referralError } = await supabase
      .from("referrals")
      .select("*")
      .eq("referral_code", referralCode)
      .single()

    if (!referralError && referral) {
      await supabase
        .from("referrals")
        .update({
          referred_id: user.id,
          status: "pending_conversion",
        })
        .eq("id", referral.id)
    }
  }

  return {
    success: true,
    user,
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return {
      error: "Email and password are required",
    }
  }

  const supabase = createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: error.message,
    }
  }

  return {
    success: true,
    user,
  }
}

export async function signOut() {
  const supabase = createServerClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return {
      error: error.message,
    }
  }

  redirect("/login")
}
