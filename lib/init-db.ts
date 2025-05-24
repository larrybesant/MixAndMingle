import { sql } from "@/lib/db"

export async function initializeDatabase() {
  try {
    // Create enums
    await sql`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
        EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
      
      DO $$ BEGIN
        CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
        EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
      
      DO $$ BEGIN
        CREATE TYPE review_rating AS ENUM ('1', '2', '3', '4', '5');
        EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uuid UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        bio TEXT,
        profile_image TEXT,
        role user_role DEFAULT 'user' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `

    // Create events table
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        uuid UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        max_attendees INTEGER,
        host_id INTEGER NOT NULL REFERENCES users(id),
        status event_status DEFAULT 'draft' NOT NULL,
        cover_image TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `

    // Create event_attendees table
    await sql`
      CREATE TABLE IF NOT EXISTS event_attendees (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        is_confirmed BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `

    // Create reviews table
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        rating review_rating NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `

    return { success: true, message: "Database initialized successfully" }
  } catch (error) {
    console.error("Error initializing database:", error)
    return { success: false, error }
  }
}
