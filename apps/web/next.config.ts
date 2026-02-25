import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@job-platform/shared-types',
    '@job-platform/shared-validators',
    '@job-platform/shared-constants',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
