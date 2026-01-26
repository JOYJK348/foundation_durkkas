/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/w/:slug/:path*',
        destination: '/workspace/:path*',
      },
      {
        source: '/b/:slug/:path*',
        destination: '/branch/:path*',
      }
    ];
  },
};

export default nextConfig;
