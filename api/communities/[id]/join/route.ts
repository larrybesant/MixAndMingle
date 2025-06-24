import { NextRequest, NextResponse } from 'next/server';
import { CommunityService } from '@/lib/services/community-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await CommunityService.joinCommunity(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error joining community:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join community' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await CommunityService.leaveCommunity(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error leaving community:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to leave community' },
      { status: 500 }
    );
  }
}
