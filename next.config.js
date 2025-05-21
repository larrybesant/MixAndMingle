const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["firebasestorage.googleapis.com", "lh3.googleusercontent.com"],
    unoptimized: true,
  },
  // Enhanced webpack configuration for Node.js polyfills
  webpack: (config, { isServer }) => {
    // Only apply these changes for client-side bundles
    if (!isServer) {
      // Provide fallbacks for Node.js core modules
      config.resolve.fallback = {
        // Crypto and security modules
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
        dgram: false,
        dns: false,

        // Process and OS modules
        process: require.resolve("process/browser"),
        os: require.resolve("os-browserify/browser"),

        // Utility modules
        util: require.resolve("util/"),
        assert: require.resolve("assert/"),
        url: require.resolve("url/"),
        zlib: require.resolve("browserify-zlib"),
        querystring: require.resolve("querystring-es3"),

        // Additional modules
        constants: require.resolve("constants-browserify"),
        timers: require.resolve("timers-browserify"),
        domain: require.resolve("domain-browser"),
        string_decoder: require.resolve("string_decoder/"),
        punycode: require.resolve("punycode/"),
        events: require.resolve("events/"),

        // Modules that should be set to false (not needed in browser)
        child_process: false,
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
        diagnostics_channel: false,
        sys: false,
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

module.exports = withBundleAnalyzer(nextConfig)
