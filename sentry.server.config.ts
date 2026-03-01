import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring — sample 20% in production to control costs
  tracesSampleRate: 0.2,

  // Enable structured logging
  enableLogs: true,

  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ['warn', 'error'] }),
  ],

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',
})
