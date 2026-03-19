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
      // API proxy to backend
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
      // Workspace routes
      {
        source: '/w/:slug/:path*',
        destination: '/workspace/:path*',
      },
      // Branch admin routes
      {
        source: '/b/:slug/:path*',
        destination: '/ems/branch-admin/:path*',
      }
    ];
  },
};

export default nextConfig;
