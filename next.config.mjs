/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false, // Harden: fail build on lint errors
  },
  typescript: {
    ignoreBuildErrors: false, // Re-enable TypeScript checking now that errors are fixed
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-image-domain.com',
        port: '',
        pathname: '/**',
      },
      // Add more patterns as needed for production
    ],
  },
}

export default nextConfig
