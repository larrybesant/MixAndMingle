import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

// Define protected routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/streams/create", "/streams/broadcast", "/dj-profile", "/settings"]

// Define routes that require admin access
const ADMIN_ROUTES = ["/dashboard/admin"]

export async function middleware(request: NextRequest) {
  try {
    // Create a Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => request.cookies.get(name)?.value,
          set: (name, value, options) => {
            // This is a no-op in middleware
          },
          remove: (name, options) => {
            // This is a no-op in middleware
          },
        },
      },
    )

    // Get the current session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Check if the route is protected
    const isProtectedRoute = PROTECTED_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route))

    // Check if the route requires admin access
    const isAdminRoute = ADMIN_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route))

    // If the route is protected and the user is not authenticated, redirect to login
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If the route requires admin access, check if the user is an admin
    if (isAdminRoute && session) {
      // Get the user's role
      const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

      // If the user is not an admin, redirect to dashboard
      if (error || profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    // Continue with the request
    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)

    // In case of an error, redirect to login for protected routes
    const isProtectedRoute = PROTECTED_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route))

    if (isProtectedRoute) {
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return NextResponse.next()
  }
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/streams/create",
    "/streams/broadcast/:path*",
    "/dj-profile/:path*",
    "/settings/:path*",
  ],
}
