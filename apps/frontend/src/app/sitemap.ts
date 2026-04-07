import { MetadataRoute } from 'next';

/**
 * Dompet Kita - Dynamic Sitemap Generator
 * Ensures all primary routes are indexed for search engine optimization.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dompet-kita.com';

  const routes = [
    '',
    '/auth/login',
    '/auth/register',
    '/wealth',
    '/transactions',
    '/budget',
    '/dreams',
    '/loans',
    '/holiday',
    '/heritage',
    '/family-hub',
    '/settings',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
