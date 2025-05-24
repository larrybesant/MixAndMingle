/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://mix-and-mingle.vercel.app",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ["/test-*", "/admin/*", "/api/*", "/dashboard/*"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/test-*", "/admin/*", "/api/*", "/dashboard/*"],
      },
    ],
  },
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: path === "/" ? "daily" : "weekly",
      priority: path === "/" ? 1.0 : 0.7,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  },
}
