import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@wp-next-public/core', '@wp-next-public/react'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '#wpHost' },
      { protocol: 'http', hostname: '#wpHost' },
    ],
  },
  // ISR revalidation when WP content changes
  // Triggered by POST /api/revalidate
};

export default nextConfig;
