import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { CommunityService } from '@/lib/services/community-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category_id, genre_id, is_private, max_members, rules, tags } = body;

    // Basic validation
    if (!name || !category_id) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    // Create the community
    const community = await CommunityService.createCommunity({
      name,
      description,
      category_id,
      genre_id,
      is_private: is_private || false,
      max_members: max_members || 1000,
      rules,
      tags: tags || []
    });

    return NextResponse.json({ success: true, community });
  } catch (error: any) {
    console.error('Community creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create community' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const communities = await CommunityService.getPublicCommunities(
      page,
      limit,
      category,
      search
    );

    return NextResponse.json({ communities });
  } catch (error: any) {
    console.error('Error fetching communities:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}
