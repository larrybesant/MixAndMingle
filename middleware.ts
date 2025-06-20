import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/create-profile",
  "/go-live",
  "/room",
  "/messages",
  "/notifications",
  "/admin"
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  // Check for Supabase auth cookie (adjust if you use a different session method)
  const token = request.cookies.get("sb-access-token")?.value;

  if (isProtected && !token) {
    // Redirect unauthenticated users to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/create-profile",
    "/go-live",
    "/room/:path*",
    "/messages",
    "/notifications",
    "/admin"
  ]
};
