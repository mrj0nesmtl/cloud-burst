/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server Actions are stable in Next.js 14, no need for experimental flag
  experimental: {},
  // Disable error overlay completely
  devIndicators: {
    position: 'bottom-right',
    buildError: false,
  },
  // Disable React DevTools in production
  reactStrictMode: true,
  // Disable error overlay in production
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Add webpack config for sharp
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'sharp']
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cb-beta.replit.app',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // Add output configuration for better production builds
  output: 'standalone',
}

module.exports = nextConfig 