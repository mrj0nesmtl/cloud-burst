/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

const nextConfig = {
  // Configure error handling and development indicators
  devIndicators: {
    position: 'bottom-right',
    buildError: false,
  },
  // Use strict mode for better development experience
  reactStrictMode: true,
  // Configure on-demand entries for better development
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Configure output for better production builds
  output: 'standalone',
  // Configure image domains
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
      },
      {
        protocol: 'https',
        hostname: '**.replit.app',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // Remove experimental features
  // webpack: (config, { isServer }) => {
  //   // Optimize CSS loading
  //   if (!isServer) {
  //     config.optimization.splitChunks.cacheGroups = {
  //       ...config.optimization.splitChunks.cacheGroups,
  //       styles: {
  //         name: 'styles',
  //         test: /\.(css|scss)$/,
  //         chunks: 'all',
  //         enforce: true,
  //       },
  //     };
  //   }
  //   return config;
  // },
}

module.exports = withPWA(nextConfig) 