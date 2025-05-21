/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ Dangerous! Only use this for testing, fix type errors for production
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["firebasestorage.googleapis.com", "lh3.googleusercontent.com"],
    unoptimized: true,
  },
  // Comprehensive webpack configuration for Node.js polyfills
  webpack: (config, { isServer }) => {
    // Only apply these changes for client-side bundles
    if (!isServer) {
      // Provide fallbacks for Node.js core modules
      config.resolve.fallback = {
        // Crypto and related modules
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),

        // File system and path modules
        fs: false, // Set to false to ignore (not used in browser)
        path: require.resolve("path-browserify"),

        // Network-related modules
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        net: false,
        tls: false,

        // Process and OS modules
        process: require.resolve("process/browser"),
        os: require.resolve("os-browserify/browser"),

        // Utility modules
        util: require.resolve("util/"),
        assert: require.resolve("assert/"),
        url: require.resolve("url/"),
        zlib: require.resolve("browserify-zlib"),
        querystring: require.resolve("querystring-es3"),

        // Other Node.js modules (set to false if not needed)
        child_process: false,
        dns: false,
        dgram: false,
        cluster: false,
        module: false,
        perf_hooks: false,
        v8: false,
        vm: false,
        async_hooks: false,
        worker_threads: false,
        inspector: false,
        readline: false,
        repl: false,
        constants: false,
        diagnostics_channel: false,
        domain: false,
        events: require.resolve("events/"),
        punycode: false,
        string_decoder: false,
        sys: false,
        timers: false,
        tty: false,
        wasi: false,
      }

      // Provide global variables that some modules expect
      config.plugins.push(
        new config.webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        }),
      )
    }

    return config
  },
}

module.exports = nextConfig
