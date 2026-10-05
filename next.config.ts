import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // 100 % static: no server, no functions. Output in out/.
  output: 'export',
  trailingSlash: false,
  images: { unoptimized: true },
  reactStrictMode: true,
  // Single 404.html shared by both locales (app/global-not-found.tsx).
  experimental: { globalNotFound: true },
};

export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig);
