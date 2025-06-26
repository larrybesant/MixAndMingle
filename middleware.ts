import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

console.log("[MIDDLEWARE] File loaded");

const protectedRoutes = [
  "/dashboard",
  "/create-profile",
  "/go-live",
  "/room",
  "/messages",
  "/notifications",
  "/admin"
];

<<<<<<< HEAD
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });
  const { data: { user } } = await supabase.auth.getUser();

  console.log("[MIDDLEWARE] Cookies:", request.cookies.getAll());
  console.log("[MIDDLEWARE] Supabase user:", user);

  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );
=======
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
>>>>>>> 1ef822f059b7d81d49cba6111a546fd184845679

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
<<<<<<< HEAD
  matcher: "/:path*",
=======
  matcher: [
    "/dashboard",
    "/create-profile",
    "/go-live",
    "/room/:path*",
    "/messages",
    "/notifications",
    "/admin"
  ]
>>>>>>> 1ef822f059b7d81d49cba6111a546fd184845679
};
