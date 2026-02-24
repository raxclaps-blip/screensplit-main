/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  cacheComponents: true,
  serverExternalPackages: ['@ffmpeg-installer/ffmpeg'],
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    optimizeCss: true,
  },
  async redirects() {
    return [
      { source: '/screensplit', destination: '/apps/screensplit', permanent: true },
      { source: '/screensplit/:path*', destination: '/apps/screensplit/:path*', permanent: true },
      { source: '/optimizer', destination: '/apps/optimizer', permanent: true },
      { source: '/optimizer/:path*', destination: '/apps/optimizer/:path*', permanent: true },
      { source: '/converter', destination: '/apps/converter', permanent: true },
      { source: '/converter/:path*', destination: '/apps/converter/:path*', permanent: true },
      { source: '/settings', destination: '/apps/settings', permanent: true },
      { source: '/settings/:path*', destination: '/apps/settings/:path*', permanent: true },
      { source: '/support', destination: '/apps/support', permanent: true },
      { source: '/support/:path*', destination: '/apps/support/:path*', permanent: true },
      { source: '/gallery', destination: '/apps/gallery', permanent: true },
      { source: '/gallery/:path*', destination: '/apps/gallery/:path*', permanent: true },
      { source: '/image-tools', destination: '/apps/image-tools', permanent: true },
      { source: '/image-tools/:path*', destination: '/apps/image-tools/:path*', permanent: true },
    ]
  },
}

export default nextConfig
