import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fanplace.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/account/',
          '/_next/',
          '/auth/error',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

