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
  // Add webpack configuration to handle Node.js modules
  webpack: (config, { isServer }) => {
    // If client-side, add fallbacks for Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        http2: false,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
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
        querystring: false,
        string_decoder: false,
        sys: false,
        timers: false,
        tty: false,
        url: false,
        util: false,
        wasi: false,
        assert: false,
        buffer: require.resolve("buffer/"),
        process: require.resolve("process/browser"),
      }

      // Add polyfills
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
