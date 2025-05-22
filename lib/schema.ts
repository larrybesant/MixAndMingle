import { pgTable, serial, text, timestamp, boolean, integer, uuid, pgEnum } from "drizzle-orm/pg-core"

// Create enums for various status types
export const userRoleEnum = pgEnum("user_role", ["user", "admin", "moderator"])
export const eventStatusEnum = pgEnum("event_status", ["draft", "published", "cancelled", "completed"])
export const reviewRatingEnum = pgEnum("review_rating", ["1", "2", "3", "4", "5"])

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  bio: text("bio"),
  profileImage: text("profile_image"),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  maxAttendees: integer("max_attendees"),
  hostId: integer("host_id")
    .notNull()
    .references(() => users.id),
  status: eventStatusEnum("status").default("draft").notNull(),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Event attendees junction table
export const eventAttendees = pgTable("event_attendees", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  isConfirmed: boolean("is_confirmed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  rating: reviewRatingEnum("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
