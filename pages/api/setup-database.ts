import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if tables exist by trying to query them
    const checks = await Promise.allSettled([
      supabase.from('profiles').select('count', { count: 'exact', head: true }),
      supabase.from('dj_rooms').select('count', { count: 'exact', head: true }),
      supabase.from('matches').select('count', { count: 'exact', head: true }),
      supabase.from('chat_messages').select('count', { count: 'exact', head: true }),
    ]);

    const tablesExist = checks.every(check => check.status === 'fulfilled');

    if (!tablesExist) {
      return res.status(400).json({ 
        error: 'Database tables not found. Please run the SQL setup script in Supabase dashboard.',
        setupRequired: true,
        instructions: [
          '1. Go to your Supabase project dashboard',
          '2. Navigate to SQL Editor',
          '3. Copy and run the contents of database/quick-setup.sql',
          '4. Refresh this endpoint'
        ]
      });
    }    // If tables exist, create some sample data if none exists
    const { count: profileCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (profileCount === 0) {
      // Create sample profiles
      await supabase.from('profiles').insert([
        {
          id: '11111111-1111-1111-1111-111111111111',
          username: 'dj_alice',
          bio: 'Electronic music producer from LA 🎵',
          music_preferences: ['Electronic', 'House', 'Techno'],
          avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b5d1?w=150&h=150&fit=crop&crop=face',
          location: 'Los Angeles, CA'
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          username: 'beatmaker_bob',
          bio: 'Hip-hop beats and chill vibes ✨',
          music_preferences: ['Hip-Hop', 'R&B', 'Jazz'],
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          location: 'New York, NY'
        },
        {
          id: '33333333-3333-3333-3333-333333333333',
          username: 'vinyl_sara',
          bio: 'Vinyl collector & indie rock enthusiast 🎶',
          music_preferences: ['Indie', 'Rock', 'Alternative'],
          avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          location: 'Austin, TX'
        }
      ]);

      // Create sample rooms
      await supabase.from('dj_rooms').insert([
        {
          id: 'room-demo-1',
          name: 'Electronic Vibes Live',
          genre: 'Electronic',
          description: 'Join me for some late night electronic beats!',
          host_id: '11111111-1111-1111-1111-111111111111',
          is_live: true,
          viewer_count: 23,
          max_viewers: 100
        },
        {
          id: 'room-demo-2',
          name: 'Hip-Hop Freestyle Session',
          genre: 'Hip-Hop',
          description: 'Live beats and freestyle rap session',
          host_id: '22222222-2222-2222-2222-222222222222',
          is_live: false,
          viewer_count: 0,
          max_viewers: 50
        }
      ]);
    }    return res.status(200).json({ 
      success: true, 
      message: 'Database is properly configured!',
      tablesFound: true,
      sampleDataCreated: profileCount === 0
    });

  } catch (error) {
    console.error('Database setup error:', error);
    return res.status(500).json({ 
      error: 'Database setup failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
