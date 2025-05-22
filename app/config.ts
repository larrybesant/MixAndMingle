// Configuration file for your Mix & Mingle application

// App URLs
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://djmixandmingle.com"
export const API_URL = process.env.NEXT_PUBLIC_API_URL || `${APP_URL}/api`

// App information
export const APP_NAME = "Mix & Mingle"
export const APP_DESCRIPTION = "Connect with friends and plan events"

// Social media links
export const SOCIAL_LINKS = {
  twitter: "https://twitter.com/djmixandmingle",
  instagram: "https://instagram.com/djmixandmingle",
  facebook: "https://facebook.com/djmixandmingle",
}

// SEO defaults
export const DEFAULT_SEO = {
  title: "Mix & Mingle - Connect with friends and plan events",
  description: "Join live DJ sets from around the world. Chat and mingle with other music lovers.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    site_name: APP_NAME,
    images: [
      {
        url: `${APP_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: APP_NAME,
      },
    ],
  },
  twitter: {
    handle: "@djmixandmingle",
    site: "@djmixandmingle",
    cardType: "summary_large_image",
  },
}

// API configuration
export const API_CONFIG = {
  baseUrl: API_URL,
  timeout: 10000, // 10 seconds
  retries: 3,
}
