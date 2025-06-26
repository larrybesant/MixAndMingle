import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";

const SubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

/**
 * Returns a Supabase client with optional Authorization header.
 * @param access_token - Optional JWT for authenticated requests
 */
function getSupabaseWithAuth(access_token?: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: access_token ? `Bearer ${access_token}` : "",
        },
      },
    },
  );
}

/**
 * TODO: Replace in-memory rate limiting with distributed store (e.g., Redis) for multi-instance deployments.
 * TODO: Integrate advanced logging/monitoring (Datadog, LogRocket, etc) for production.
 * TODO: Add analytics event for successful push subscription (e.g., Segment, Amplitude).
 */
function checkRateLimit(ip: string, limit = 10, windowMs = 60_000): boolean {
  type RateLimitStore = Record<string, number[]>;
  const globalWithRateLimit = global as typeof globalThis & {
    pushRateLimit?: RateLimitStore;
  };
  if (!globalWithRateLimit.pushRateLimit)
    globalWithRateLimit.pushRateLimit = {};
  const rl = globalWithRateLimit.pushRateLimit;
  const now = Date.now();
  if (!rl[ip]) rl[ip] = [];
  rl[ip] = rl[ip].filter((t: number) => now - t < windowMs);
  if (rl[ip].length >= limit) return false;
  rl[ip].push(now);
  return true;
}

/**
 * Handles push subscription POST requests with validation, auth, rate limiting, and error logging.
 */
export async function POST(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  if (!checkRateLimit(ip)) {
    Sentry.captureMessage(`Rate limit exceeded for ${ip}`);
    return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  }

  let subscription;
  try {
    const body = await req.json();
    subscription = SubscriptionSchema.parse(body.subscription);
  } catch (err: unknown) {
    Sentry.captureException(err);
    return new NextResponse(
      JSON.stringify({ error: "Invalid subscription data" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  // Get access token from cookies (if using Supabase Auth)
  const access_token = req.cookies.get("sb-access-token")?.value;
  const supabase = getSupabaseWithAuth(access_token);
  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    Sentry.captureMessage("Not authenticated", "warning");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Save subscription to Supabase
  const { endpoint, keys } = subscription;
  const { error } = await supabase.from("push_subscriptions").upsert({
    user_id: user.id,
    endpoint,
    keys,
  });
  if (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(
    { success: true },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
