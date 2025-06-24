import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Communities table
    const { error: communitiesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS communities (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT,
          category_id TEXT NOT NULL,
          genre_id TEXT,
          creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          avatar_url TEXT,
          banner_url TEXT,
          is_private BOOLEAN DEFAULT false,
          invite_code TEXT UNIQUE DEFAULT substring(gen_random_uuid()::text from 1 for 8),
          member_count INTEGER DEFAULT 1,
          max_members INTEGER DEFAULT 1000,
          rules TEXT,
          tags TEXT[] DEFAULT '{}',
          settings JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (communitiesError) {
      console.error('Communities table error:', communitiesError);
      return NextResponse.json({ error: communitiesError.message }, { status: 500 });
    }

    // Community members table
    const { error: membersError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS community_members (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('creator', 'admin', 'moderator', 'member')),
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(community_id, user_id)
        );
      `
    });

    if (membersError) {
      console.error('Members table error:', membersError);
      return NextResponse.json({ error: membersError.message }, { status: 500 });
    }

    // Community posts table
    const { error: postsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS community_posts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
          author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          title TEXT,
          content TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'poll', 'event')),
          media_urls TEXT[] DEFAULT '{}',
          is_pinned BOOLEAN DEFAULT false,
          like_count INTEGER DEFAULT 0,
          comment_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (postsError) {
      console.error('Posts table error:', postsError);
      return NextResponse.json({ error: postsError.message }, { status: 500 });
    }

    // Create indexes for better performance
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE INDEX IF NOT EXISTS idx_communities_category ON communities(category_id);
        CREATE INDEX IF NOT EXISTS idx_communities_creator ON communities(creator_id);
        CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
        CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
        CREATE INDEX IF NOT EXISTS idx_community_posts_community ON community_posts(community_id);
        CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts(author_id);
      `
    });

    if (indexError) {
      console.error('Index error:', indexError);
      return NextResponse.json({ error: indexError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Communities schema setup complete!' 
    });

  } catch (error: any) {
    console.error('Schema setup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to setup schema' },
      { status: 500 }
    );
  }
}
