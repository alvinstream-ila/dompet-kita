import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import path from "node:path";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    // ppr: 'incremental',
    taint: true,
  },
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during bundling
  silent: true,
  org: "alvinstream",
  project: "dompet-kita-frontend",

  // Sentry Next.js SDK Options
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
});
