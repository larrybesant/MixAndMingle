// Sentry client-side config for Next.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0, // Enable tracing for production
  environment: process.env.NODE_ENV,
  integrations: (integrations) => integrations.filter(i => i.name !== 'OpenTelemetry'),
});
