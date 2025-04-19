/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure error handling and development indicators
  // Server Actions are stable in Next.js 14, no need for experimental flag
  experimental: {
    // Server Actions are now available by default
  },
  // Disable error overlay completely
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
  // Remove standalone output for development mode
  // output: 'standalone',
  
  // Disable type checking during development to avoid errors
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  
  // Disable ESLint during development
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  
  // Configure image domains
  // Add webpack config for sharp
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'sharp']
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
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
        hostname: '*.replit.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/**',
      }
    ],
    // We don't need to configure domains for our proxy since it's on the same domain
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

module.exports = nextConfig 