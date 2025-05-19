import { z } from "zod"

// Profile validation schema
export const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50, "First name is too long"),
  last_name: z.string().min(1, "Last name is required").max(50, "Last name is too long"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  avatar_url: z.string().url("Invalid URL").optional().nullable(),
})

// DJ Profile validation schema
export const djProfileSchema = z.object({
  artist_name: z.string().min(1, "Artist name is required").max(100, "Artist name is too long"),
  bio: z.string().max(1000, "Bio must be at most 1000 characters").optional(),
  experience_years: z
    .number()
    .int("Experience must be a whole number")
    .min(0, "Experience cannot be negative")
    .max(100, "Experience seems too high"),
  hourly_rate: z.number().min(0, "Hourly rate cannot be negative").max(10000, "Hourly rate seems too high"),
  genres: z.array(z.string()).optional(),
  social_links: z
    .object({
      instagram: z.string().url("Invalid Instagram URL").optional().nullable(),
      twitter: z.string().url("Invalid Twitter URL").optional().nullable(),
      soundcloud: z.string().url("Invalid SoundCloud URL").optional().nullable(),
      website: z.string().url("Invalid website URL").optional().nullable(),
    })
    .optional(),
})

// Stream validation schema
export const streamSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(2000, "Description is too long").optional(),
  scheduled_start: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  thumbnail_url: z.string().url("Invalid thumbnail URL").optional().nullable(),
  is_public: z.boolean().default(true),
})

// Chat message validation schema
export const chatMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(500, "Message is too long")
    .refine((val) => !containsHarmfulContent(val), {
      message: "Message contains inappropriate content",
    }),
})

// Email validation schema
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .min(5, "Email is too short")
  .max(100, "Email is too long")

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password is too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")

// Helper function to check for harmful content
function containsHarmfulContent(content: string): boolean {
  // Check for common XSS patterns
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /onclick=/i,
  ]

  for (const pattern of xssPatterns) {
    if (pattern.test(content)) {
      return true
    }
  }

  // Check for offensive language (simplified example)
  const offensiveWords = [
    "offensive1",
    "offensive2",
    // Add more offensive words as needed
  ]

  const contentLower = content.toLowerCase()
  for (const word of offensiveWords) {
    if (contentLower.includes(word)) {
      return true
    }
  }

  return false
}

// Validate data against a schema
export function validateData<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { success: boolean; data?: T; errors?: z.ZodError } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

// Format validation errors for display
export function formatValidationErrors(errors?: z.ZodError): Record<string, string> {
  if (!errors) return {}

  const formattedErrors: Record<string, string> = {}

  for (const issue of errors.issues) {
    const path = issue.path.join(".")
    formattedErrors[path] = issue.message
  }

  return formattedErrors
}
