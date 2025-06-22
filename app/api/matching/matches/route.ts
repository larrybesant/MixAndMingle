import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return mock matches data
    const mockMatches = [
      {
        id: 'match1',
        user1_id: user.user.id,
        user2_id: '1',
        matched_at: '2024-01-15T10:30:00Z',
        is_active: true,
        last_message_at: null,
        other_user: {
          id: '1',
          username: 'DJ_Alex',
          full_name: 'Alex Johnson',
          avatar_url: null,
          bio: 'Electronic music producer and DJ. Love house and techno!',
          music_preferences: ['House', 'Techno', 'Electronic'],
          is_dj: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      },
      {
        id: 'match2',
        user1_id: user.user.id,
        user2_id: '2',
        matched_at: '2024-01-14T15:45:00Z',
        is_active: true,
        last_message_at: null,
        other_user: {
          id: '2',
          username: 'musiclover23',
          full_name: 'Sarah Chen',
          avatar_url: null,
          bio: 'Always looking for new music and great vibes ✨',
          music_preferences: ['Pop', 'R&B', 'Hip-Hop'],
          is_dj: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      }
    ];

    return NextResponse.json({ matches: mockMatches });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
