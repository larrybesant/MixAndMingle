import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/events/new",
    "/dj-profile",
    "/streams/new",
    "/profile",
    "/settings",
    "/my-events",
    "/friends",
    "/chat-rooms",
  ]

  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // Admin routes that require admin privileges
  const adminRoutes = ["/admin"]
  const isAdminRoute = adminRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // If accessing a protected route without a session, redirect to login
  if (isProtectedRoute && !session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/signin"
    redirectUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If accessing admin routes, check if user is admin
  if (isAdminRoute && session) {
    try {
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

      // For debugging purposes, log the admin status
      console.log("Admin check for user:", session.user.id, "is_admin:", profile?.is_admin)

      if (!profile?.is_admin) {
        // Redirect non-admin users to dashboard
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = "/dashboard"
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      console.error("Error checking admin status:", error)
      // Continue anyway for now to help with debugging
    }
  }

  // If accessing auth pages with a session, redirect to dashboard
  const authRoutes = ["/signin", "/signup"]
  const isAuthRoute = authRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  if (isAuthRoute && session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/dashboard"
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/events/new",
    "/dj-profile/:path*",
    "/streams/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/admin-test",
    "/signin",
    "/signup",
    "/my-events/:path*",
    "/friends/:path*",
    "/chat-rooms/:path*",
    "/api/:path*",
  ],
}
