import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    console.log('🔧 Starting 405 Auth Error Fix...');
    
    // Use service role key for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Service role key not configured'
      }, { status: 500 });
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Critical SQL to fix the 405 error
    const fixQueries = [
      // Create profiles table
      `
        CREATE TABLE IF NOT EXISTS public.profiles (
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
      `,
      
      // Enable RLS
      `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`,
      
      // Create the trigger function that fixes the 405 error
      `
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.profiles (id, username, full_name, avatar_url)
          VALUES (
            new.id, 
            new.raw_user_meta_data->>'username',
            new.raw_user_meta_data->>'full_name', 
            new.raw_user_meta_data->>'avatar_url'
          );
          RETURN new;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `,
      
      // Create the trigger
      `
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
      `,
      
      // RLS policies
      `
        DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
        CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
          FOR SELECT USING (true);
      `,
      `
        DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
        CREATE POLICY "Users can insert their own profile" ON public.profiles
          FOR INSERT WITH CHECK (auth.uid() = id);
      `,
      `
        DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
        CREATE POLICY "Users can update their own profile" ON public.profiles
          FOR UPDATE USING (auth.uid() = id);
      `
    ];
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < fixQueries.length; i++) {
      const query = fixQueries[i].trim();
      if (query.length === 0) continue;
      
      try {
        console.log(`⚙️  Executing fix query ${i + 1}/${fixQueries.length}`);
          // Execute the query using supabase admin client
        const { error } = await supabaseAdmin.rpc('exec_sql', { 
          sql_statement: query 
        });
        
        if (error) {
          console.warn(`⚠️  Error on query ${i + 1}:`, error);
          errors.push(`Query ${i + 1}: ${error.message}`);
        } else {
          results.push(`Query ${i + 1}: Success`);
        }      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.warn(`⚠️  Exception on query ${i + 1}:`, error);
        errors.push(`Query ${i + 1}: ${errorMessage}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: '🎉 405 Auth Error Fix completed!',
      results,
      errors,
      note: 'If there are errors, you may need to run the SQL manually in Supabase Dashboard'
    });
      } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Fix failed:', error);
    return NextResponse.json({
      success: false,
      error: errorMessage,
      note: 'Please run the SQL file manually in your Supabase Dashboard'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Auth Fix API - Use POST to run the fix',
    instructions: 'This API fixes the 405 error by creating the missing trigger function'
  });
}
