import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Starting automatic database setup...');

    // Create profiles table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          username TEXT UNIQUE,
          full_name TEXT,
          avatar_url TEXT,
          bio TEXT,
          date_of_birth DATE,
          music_preferences TEXT[],
          is_dj BOOLEAN DEFAULT false,
          location TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Create dj_rooms table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS dj_rooms (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          genre TEXT,
          host_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          is_live BOOLEAN DEFAULT false,
          viewer_count INTEGER DEFAULT 0,
          max_viewers INTEGER DEFAULT 100,
          stream_url TEXT,
          tags TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Create matches table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS matches (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_active BOOLEAN DEFAULT true,
          UNIQUE(user1_id, user2_id),
          CHECK (user1_id < user2_id)
        );
      `
    });

    // Create user_swipes table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_swipes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          swiper_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          swiped_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          action TEXT NOT NULL CHECK (action IN ('like', 'pass', 'super_like')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(swiper_id, swiped_id)
        );
      `
    });

    // Create chat_messages table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS chat_messages (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          room_id TEXT REFERENCES dj_rooms(id) ON DELETE CASCADE,
          user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          message TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Create indexes
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_dj_rooms_host_id ON dj_rooms(host_id);
        CREATE INDEX IF NOT EXISTS idx_dj_rooms_is_live ON dj_rooms(is_live);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
        CREATE INDEX IF NOT EXISTS idx_user_swipes_swiper_id ON user_swipes(swiper_id);
        CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(user1_id, user2_id);
      `
    });

    console.log('Database tables created successfully');

    // Insert sample data
    try {
      // Sample profiles
      const sampleProfiles = [
        {
          id: '11111111-1111-1111-1111-111111111111',
          username: 'dj_alex',
          full_name: 'Alex Martinez',
          bio: 'Electronic music producer and DJ from LA 🎵',
          music_preferences: ['Electronic', 'House', 'Techno'],
          is_dj: true,
          location: 'Los Angeles, CA',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          username: 'music_lover_sam',
          full_name: 'Sam Johnson',
          bio: 'Music lover and party enthusiast ✨',
          music_preferences: ['Pop', 'Hip-Hop', 'R&B'],
          is_dj: false,
          location: 'New York, NY',
          avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b5d1?w=150&h=150&fit=crop&crop=face'
        },
        {
          id: '33333333-3333-3333-3333-333333333333',
          username: 'vinyl_collector',
          full_name: 'Taylor Chen',
          bio: 'Vinyl collector and indie music fan 🎶',
          music_preferences: ['Indie', 'Alternative', 'Jazz'],
          is_dj: false,
          location: 'Austin, TX',
          avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        }
      ];

      await supabase.from('profiles').upsert(sampleProfiles, { 
        onConflict: 'id',
        ignoreDuplicates: true 
      });

      // Sample rooms
      const sampleRooms = [
        {
          id: 'room-demo-electronic',
          name: 'Friday Night Electronic Vibes',
          description: 'Best electronic beats to end the week! Join me for some late night energy.',
          genre: 'Electronic',
          host_id: '11111111-1111-1111-1111-111111111111',
          is_live: true,
          viewer_count: 23,
          max_viewers: 100,
          tags: ['electronic', 'weekend', 'party', 'house']
        },
        {
          id: 'room-demo-indie',
          name: 'Chill Indie Afternoon',
          description: 'Relaxing indie and alternative music for your afternoon vibes.',
          genre: 'Indie',
          host_id: '33333333-3333-3333-3333-333333333333',
          is_live: false,
          viewer_count: 0,
          max_viewers: 50,
          tags: ['indie', 'chill', 'alternative', 'relaxing']
        }
      ];

      await supabase.from('dj_rooms').upsert(sampleRooms, { 
        onConflict: 'id',
        ignoreDuplicates: true 
      });

      console.log('Sample data inserted successfully');

      return res.status(200).json({
        success: true,
        message: 'Database setup completed successfully! 🎉',
        details: {
          tablesCreated: 5,
          indexesCreated: 5,
          sampleProfilesCreated: 3,
          sampleRoomsCreated: 2
        }
      });

    } catch (dataError) {
      console.warn('Tables created but sample data insertion failed:', dataError);
      return res.status(200).json({
        success: true,
        message: 'Database setup completed (tables created, but sample data may need manual insertion)',
        warning: 'Sample data insertion failed',
        details: dataError instanceof Error ? dataError.message : 'Unknown error'
      });
    }

  } catch (error) {
    console.error('Database setup failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Please run the SQL script manually in your Supabase dashboard'
    });
  }
}
