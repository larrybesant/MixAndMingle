import { z } from "zod"

// Common validation schemas
export const urlSchema = z.string().url("Must be a valid URL").or(z.literal("")).optional().nullable()

export const futureDate = z
  .string()
  .refine(
    (date) => {
      if (!date) return true
      return new Date(date) > new Date()
    },
    { message: "Date must be in the future" },
  )
  .optional()
  .nullable()

export const dateRangeSchema = z
  .object({
    start_time: z.string(),
    end_time: z.string(),
  })
  .refine(
    (data) => {
      if (!data.start_time || !data.end_time) return true
      return new Date(data.end_time) > new Date(data.start_time)
    },
    {
      message: "End time must be after start time",
      path: ["end_time"],
    },
  )

export const positiveNumber = z
  .number()
  .positive("Must be a positive number")
  .or(
    z
      .string()
      .regex(/^\d+(\.\d+)?$/)
      .transform(Number),
  )
  .optional()
  .nullable()

export const nonEmptyString = z.string().min(1, "Cannot be empty").max(2000, "Maximum length exceeded")

export const genreSchema = z.array(
  z.enum([
    "House",
    "Techno",
    "Hip Hop",
    "R&B",
    "Pop",
    "Rock",
    "EDM",
    "Trance",
    "Drum & Bass",
    "Reggae",
    "Disco",
    "Jazz",
    "Funk",
    "Soul",
    "Latin",
    "Other",
  ]),
)

// Validation schemas for different entities
export const djProfileSchema = z.object({
  artist_name: nonEmptyString,
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional().nullable(),
  experience_years: positiveNumber,
  hourly_rate: positiveNumber,
  genre: genreSchema,
  portfolio_links: z.array(urlSchema).optional().nullable(),
})

export const eventSchema = z
  .object({
    title: nonEmptyString,
    description: z.string().max(2000, "Description cannot exceed 2000 characters").optional().nullable(),
    location: nonEmptyString,
    start_time: futureDate,
    end_time: futureDate,
  })
  .refine(
    (data) => {
      if (!data.start_time || !data.end_time) return true
      return new Date(data.end_time) > new Date(data.start_time)
    },
    {
      message: "End time must be after start time",
      path: ["end_time"],
    },
  )

export const streamSchema = z.object({
  title: nonEmptyString,
  description: z.string().max(2000, "Description cannot exceed 2000 characters").optional().nullable(),
  scheduled_start: futureDate,
  is_public: z.boolean().optional(),
  event_id: z.string().uuid().optional().nullable(),
})

export const chatMessageSchema = z.object({
  content: nonEmptyString.max(500, "Message cannot exceed 500 characters"),
  room_id: z.string().uuid(),
})

export const directMessageSchema = z.object({
  content: nonEmptyString.max(1000, "Message cannot exceed 1000 characters"),
  recipient_id: z.string().uuid(),
  attachment_url: urlSchema,
  attachment_type: z.string().optional().nullable(),
  is_voice_message: z.boolean().optional(),
})

export const songRequestSchema = z.object({
  song_title: nonEmptyString,
  artist: nonEmptyString,
  message: z.string().max(200, "Message cannot exceed 200 characters").optional().nullable(),
  stream_id: z.string().uuid(),
})

// Utility function to validate data against a schema
export function validateData<T>(schema: z.ZodType<T>, data: unknown): { success: boolean; data?: T; error?: string } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
      return { success: false, error: errorMessage }
    }
    return { success: false, error: "Validation failed" }
  }
}
