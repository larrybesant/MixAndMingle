@"
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
}

export default nextConfig
"@ | Out-File -FilePath "next.config.mjs" -Encoding UTF8