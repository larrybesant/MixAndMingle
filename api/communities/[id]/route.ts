import { NextRequest, NextResponse } from 'next/server';
import { CommunityService } from '@/lib/services/community-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const community = await CommunityService.getCommunityById(params.id);
    
    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ community });
  } catch (error: any) {
    console.error('Error fetching community:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch community' },
      { status: 500 }
    );
  }
}
