// Sentry server-side config for Next.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0, // Adjust for production
  environment: process.env.NODE_ENV,
});
