import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://b27907a914db76a4f711153b075a4ec5@o4511049545089024.ingest.us.sentry.io/4511049653420032",
  // Tracing must be enabled for agent monitoring to work
  tracesSampleRate: 1.0,
  // Add data like inputs and responses to/from LLMs and tools
  sendDefaultPii: true,
  environment: import.meta.env.MODE,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Performance Monitoring
  tracePropagationTargets: ["localhost", /^https:\/\/lftxmhvmswxhohchnnkn\.supabase\.co/],

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
