import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("🔧 Starting 405 auth fix...");

    // The enhanced SQL fix that should resolve the 405 error
    const enhancedAuthFixSQL = `
      -- ENHANCED AUTH FIX - More robust trigger function
      
      -- 1. First, let's drop the existing trigger to avoid conflicts
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      
      -- 2. Drop the existing function
      DROP FUNCTION IF EXISTS public.handle_new_user();
      
      -- 3. Create a more robust trigger function with error handling
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER 
      LANGUAGE plpgsql 
      SECURITY DEFINER
      AS $$
      BEGIN
        BEGIN
          -- Try to insert with all possible fields, using COALESCE for safety
          INSERT INTO public.profiles (
            id, 
            username, 
            full_name, 
            avatar_url,
            created_at,
            updated_at
          )
          VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username', 'New User'),
            NEW.raw_user_meta_data->>'avatar_url',
            NOW(),
            NOW()
          );
          
        EXCEPTION 
          WHEN unique_violation THEN
            -- If user already exists, just update the profile
            UPDATE public.profiles 
            SET 
              username = COALESCE(NEW.raw_user_meta_data->>'username', username),
              full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name),
              avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar_url),
              updated_at = NOW()
            WHERE id = NEW.id;
            
          WHEN OTHERS THEN
            -- Log the error but don't fail the user creation
            RAISE WARNING 'Failed to create/update profile for user %: %', NEW.id, SQLERRM;
        END;
        
        RETURN NEW;
      END;
      $$;
      
      -- 4. Recreate the trigger
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
      
      -- 5. Also ensure profiles table has proper structure
      ALTER TABLE public.profiles 
        ALTER COLUMN username DROP NOT NULL,
        ALTER COLUMN full_name DROP NOT NULL;
      
      -- 6. Make sure username has a default value for existing rows
      UPDATE public.profiles 
      SET username = 'user_' || substring(id::text, 1, 8)
      WHERE username IS NULL;
    `;

    // Execute the fix using the service role client
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    console.log("🔧 Executing enhanced auth fix SQL...");
    const { error } = await supabaseAdmin.rpc("exec_sql", {
      sql: enhancedAuthFixSQL,
    });

    if (error) {
      console.error("❌ SQL execution failed:", error);
      // Try alternative method - direct query
      const { error: directError } = await supabaseAdmin
        .from("profiles")
        .select("count")
        .limit(1);

      if (directError) {
        console.error("❌ Database connection failed:", directError);
        return NextResponse.json(
          {
            success: false,
            error: "Database connection failed",
            details: directError,
          },
          { status: 500 },
        );
      }

      // If we can connect to profiles table, the issue might be with RPC
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not execute SQL fix directly. Please run the SQL manually in Supabase dashboard.",
          sql: enhancedAuthFixSQL,
        },
        { status: 400 },
      );
    }

    console.log("✅ Enhanced auth fix applied successfully!");
    return NextResponse.json({
      success: true,
      message:
        "Enhanced auth fix applied successfully! The 405 error should now be resolved.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("💥 Fix application failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to apply auth fix",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to apply the 405 auth fix",
    instructions:
      "Send a POST request to this endpoint to fix the authentication 405 error",
  });
}
