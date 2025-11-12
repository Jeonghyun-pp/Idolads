// next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ============================================
  // 이미지 최적화
  // ============================================
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Cloudinary
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net', // AWS CloudFront
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // ============================================
  // 보안 헤더
  // ============================================
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ];
  },

  // ============================================
  // 리다이렉트
  // ============================================
  async redirects() {
    return [
      // /admin → /ko/admin
      {
        source: '/admin',
        destination: '/ko/admin',
        permanent: false,
      },
      {
        source: '/account',
        destination: '/ko/account',
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
