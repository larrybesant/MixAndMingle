/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  },
  
  // Image optimization
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google profile images
      'graph.facebook.com',        // Facebook profile images
      'firebasestorage.googleapis.com', // Firebase Storage
      'placeholder.svg'            // Placeholder images
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    unoptimized: true, // Added update
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com; frame-src 'self' https://accounts.google.com;"
          }
        ]
      }
    ]
  },
  
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  
  // Bundle analyzer (optional)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
          openAnalyzer: false
        })
      )
      return config
    }
  }),
  
  // Environment variables validation
  
  
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true
      },
      {
        source: '/signup',
        destination: '/auth/signup', 
        permanent: true
      }
    ]
  },
  
  // ESLint and TypeScript configurations
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
