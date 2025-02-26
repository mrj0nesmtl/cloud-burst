/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable error overlay completely
  devIndicators: {
    buildActivityPosition: 'bottom-right',
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
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig 