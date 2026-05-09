import path from "node:path";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	typescript: {
		ignoreBuildErrors: false,
	},
	reactCompiler: true,
	cacheComponents: true,
	compiler: {
		removeConsole:
			process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
	},
	productionBrowserSourceMaps: false,
	experimental: {
		taint: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "loremflickr.com",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: 'https',
				hostname: '**.cloudflarestorage.com',
			},
			{
				protocol: 'https',
				hostname: '**.railway.app',
			},
			{
				protocol: 'https',
				hostname: '**.up.railway.app',
			},
			{
				protocol: 'http',
				hostname: 'localhost',
			},
			{
				protocol: 'https',
				hostname: 'localhost',
			},
			{
				protocol: 'http',
				hostname: '127.0.0.1',
			},
			{
				protocol: 'https',
				hostname: '127.0.0.1',
			},
		],
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
