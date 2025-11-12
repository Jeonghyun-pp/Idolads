import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fanplace.com';
  const locales = ['ko', 'en', 'ja', 'zh'];
  
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 1. 홈페이지 (모든 locale)
  locales.forEach((locale) => {
    sitemapEntries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    });
  });

  // 2. 주요 페이지 (모든 locale)
  const mainPages = ['events', 'places', 'ads'];
  locales.forEach((locale) => {
    mainPages.forEach((page) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/${page}`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.8,
      });
    });
  });

  try {
    // 3. 이벤트 상세 페이지
    const events = await prisma.event.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, updatedAt: true },
    });

    events.forEach((event) => {
      locales.forEach((locale) => {
        sitemapEntries.push({
          url: `${baseUrl}/${locale}/events/${event.id}`,
          lastModified: event.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      });
    });

    // 4. 장소 상세 페이지
    const places = await prisma.place.findMany({
      select: { id: true, updatedAt: true },
      take: 1000,
    });

    places.forEach((place) => {
      locales.forEach((locale) => {
        sitemapEntries.push({
          url: `${baseUrl}/${locale}/places/${place.id}`,
          lastModified: place.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      });
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
  }

  return sitemapEntries;
}

