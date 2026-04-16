import type { Metadata, Viewport } from 'next';
import { Dancing_Script, Inter, Outfit } from 'next/font/google';
import './globals.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Providers } from '@/components/providers/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Dompet Kita | Ultimate Wealth Management',
    template: '%s | Dompet Kita',
  },
  description:
    'Experience modern, glassmorphic financial tracking for you and your partner.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://dompet-kita.com'
  ),
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/logo-utama.svg' },
    ],
    apple: '/logo-utama.svg',
  },
  openGraph: {
    title: 'Dompet Kita | Ultimate Wealth Management',
    description:
      'Modern, glassmorphic financial tracking for you and your partner.',
    type: 'website',
    locale: 'id_ID',
    siteName: 'Dompet Kita',
  },
};

export const viewport: Viewport = {
  themeColor: '#e5f1fa',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${dancingScript.variable} antialiased`}
    >
      <head>
        {/* Preload critical background assets to avoid white flashes */}
        <link
          rel="preload"
          href="/app-bg.svg"
          as="image"
          type="image/svg+xml"
        />
      </head>
      <body className="bg-[#e5f1fa] text-slate-900 selection:bg-blue-200 selection:text-blue-900">
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
