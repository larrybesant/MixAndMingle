import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { swiped_id, action } = body;

    if (!swiped_id || !action || !['like', 'pass', 'super_like'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const swiper_id = user.user.id;

    // Prevent swiping on yourself
    if (swiper_id === swiped_id) {
      return NextResponse.json({ error: 'Cannot swipe on yourself' }, { status: 400 });
    }    // For now, just simulate the swipe action
    // TODO: Implement database logic once tables are created
    console.log(`User ${swiper_id} ${action}d user ${swiped_id}`);

    // Simulate a 30% chance of match on likes
    const isMatch = action === 'like' && Math.random() < 0.3;

    return NextResponse.json({ 
      success: true, 
      swipe: {
        swiper_id,
        swiped_id,
        action,
        created_at: new Date().toISOString()
      },
      is_match: isMatch
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
