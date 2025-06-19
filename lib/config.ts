// Configuration constants from environment variables
export const config = {
  // App Configuration
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    name: "Mix & Mingle",
    tagline: "Where Music Meets Connection",
  },

  // Room Configuration
  rooms: {
    maxNameLength: Number.parseInt(process.env.MAX_ROOM_NAME_LENGTH || "50"),
    maxDescriptionLength: Number.parseInt(process.env.MAX_ROOM_DESCRIPTION_LENGTH || "200"),
    maxTagsPerRoom: Number.parseInt(process.env.MAX_TAGS_PER_ROOM || "5"),
    maxTagLength: Number.parseInt(process.env.MAX_TAG_LENGTH || "20"),
    defaultMaxViewers: Number.parseInt(process.env.DEFAULT_MAX_VIEWERS || "100"),
    defaultCategory: process.env.DEFAULT_ROOM_CATEGORY || "Music",
    defaultGenre: process.env.DEFAULT_ROOM_GENRE || "Electronic",
  },

  // Feature Flags
  features: {
    privateRooms: process.env.ENABLE_PRIVATE_ROOMS === "true",
    roomTags: process.env.ENABLE_ROOM_TAGS === "true",
    viewerLimits: process.env.ENABLE_VIEWER_LIMITS === "true",
    ageVerification: process.env.ENABLE_AGE_VERIFICATION === "true",
    contentModeration: process.env.ENABLE_CONTENT_MODERATION === "true",
    pushNotifications: process.env.ENABLE_PUSH_NOTIFICATIONS === "true",
  },

  // Database
  database: {
    url: process.env.DATABASE_URL,
  },

  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // Twilio
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID,
  },

  // Email
  email: {
    resendApiKey: process.env.RESEND_API_KEY,
  },

  // Rate Limiting
  rateLimit: {
    maxRequests: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
    windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
  },

  // WebSocket
  websocket: {
    noBufferUtil: process.env.WS_NO_BUFFER_UTIL === "1",
    noUtf8Validate: process.env.WS_NO_UTF_8_VALIDATE === "1",
  },
} as const

// Validation function to check required environment variables
export function validateConfig() {
  const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "DATABASE_URL"]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
}

// Development helper to check if we're in development mode
export const isDevelopment = process.env.NODE_ENV === "development"
export const isProduction = process.env.NODE_ENV === "production"
