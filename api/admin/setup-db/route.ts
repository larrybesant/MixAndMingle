import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST() {
  try {
    console.log("Testing database schema creation...");

    // Test creating the matching tables
    const queries = [
      `
        CREATE TABLE IF NOT EXISTS user_swipes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          swiper_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          swiped_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          action TEXT NOT NULL CHECK (action IN ('like', 'pass', 'super_like')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(swiper_id, swiped_id)
        );
      `,
      `
        CREATE TABLE IF NOT EXISTS matches (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_active BOOLEAN DEFAULT true,
          last_message_at TIMESTAMP WITH TIME ZONE,
          UNIQUE(user1_id, user2_id),
          CHECK (user1_id < user2_id)
        );
      `,
      `
        CREATE TABLE IF NOT EXISTS match_messages (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
          sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          message TEXT NOT NULL,
          message_type TEXT DEFAULT 'text',
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      `
        CREATE TABLE IF NOT EXISTS user_preferences (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          min_age INTEGER DEFAULT 18,
          max_age INTEGER DEFAULT 50,
          preferred_distance INTEGER DEFAULT 50,
          music_genres TEXT[],
          show_me TEXT DEFAULT 'all' CHECK (show_me IN ('all', 'djs_only', 'non_djs')),
          location_lat DECIMAL(10, 8),
          location_lng DECIMAL(11, 8),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    ];

    for (const query of queries) {
      const { error } = await supabase.rpc("exec_sql", { sql_query: query });
      if (error) {
        console.log("Query result:", error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database schema checked",
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        error: "Database test failed",
        details: error,
      },
      { status: 500 },
    );
  }
}
