/** @type {import('next').NextConfig} */
const nextConfig = {
    // CORS is handled by middleware.ts
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
}

module.exports = nextConfig
