import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://b27907a914db76a4f711153b075a4ec5@o4511049545089024.ingest.us.sentry.io/4511049653420032",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
