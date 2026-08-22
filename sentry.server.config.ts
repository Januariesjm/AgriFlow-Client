import * as Sentry from "@sentry/nextjs"

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
const enabled = process.env.ENABLE_ERROR_TRACKING === "true"

if (dsn && enabled) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    debug: false,
    environment: process.env.NODE_ENV || "development",
  })
}
