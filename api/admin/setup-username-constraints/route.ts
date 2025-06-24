import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    // Create a database constraint for unique usernames
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add unique constraint on lowercase username
        ALTER TABLE profiles 
        ADD CONSTRAINT unique_username_lowercase 
        UNIQUE (LOWER(username));

        -- Create index for faster username lookups
        CREATE INDEX IF NOT EXISTS idx_profiles_username_lower 
        ON profiles (LOWER(username));
      `
    });

    if (error) {
      console.error('Database constraint error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to add username uniqueness constraint',
          details: error.message 
        }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Username uniqueness constraint added successfully' 
    });

  } catch (err) {
    console.error('Username constraint setup error:', err);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to setup username constraints',
        details: err instanceof Error ? err.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
