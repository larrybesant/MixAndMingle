// lib/sentry.ts
import * as Sentry from "@sentry/nextjs"

// Initialize Sentry
// Only initialize in production and beta environments
export function initSentry() {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
    process.env.NEXT_PUBLIC_BETA_MODE === "true"
  ) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NEXT_PUBLIC_BETA_MODE === "true" ? "beta" : process.env.NEXT_PUBLIC_VERCEL_ENV,

      // Performance monitoring
      tracesSampleRate: 1.0,

      // Session replay for better bug reproduction
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // Set user feedback as enabled
      enableUserFeedback: true,
    })
  }
}

// Capture error with context
export function captureError(error: Error, context?: Record<string, any>) {
  if (error) {
    Sentry.captureException(error, {
      extra: context,
    })
  }
}

// Set user information for better error tracking
export function setUserContext(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  })
}

// Clear user context on logout
export function clearUserContext() {
  Sentry.setUser(null)
}

// Track feature usage
export function trackFeatureUsage(featureName: string, metadata?: Record<string, any>) {
  Sentry.addBreadcrumb({
    category: "feature",
    message: `Used feature: ${featureName}`,
    data: metadata,
    level: "info",
  })
}

// For beta-specific tracking
export function trackBetaEvent(eventName: string, metadata?: Record<string, any>) {
  Sentry.addBreadcrumb({
    category: "beta",
    message: eventName,
    data: metadata,
    level: "info",
  })
}
