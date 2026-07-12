/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
  },
  transpilePackages: ['@flux-ai/common'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable static generation for error pages
  generateEtags: false,
  // Use server-side rendering instead of static generation
  output: 'standalone',
}

module.exports = nextConfig