/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['react-icons']
  },
  images: {
    domains: ['localhost'],
  },
  // Enable static export if needed for static hosting
  // output: 'export',
  // Exclude the color-scheme-mcp directory from the build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Fix multiple lockfile warning
  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig