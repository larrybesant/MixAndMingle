import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    console.log('🏗️ Setting up storage bucket for avatars...');

    // Check if avatars bucket exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return NextResponse.json({ error: 'Failed to list buckets', details: listError }, { status: 500 });
    }

    const avatarsBucket = buckets.find(bucket => bucket.name === 'avatars');
    
    if (avatarsBucket) {
      console.log('✅ Avatars bucket already exists');
      return NextResponse.json({ 
        success: true, 
        message: 'Avatars bucket already exists',
        bucket: avatarsBucket
      });
    }

    // Create the avatars bucket
    const { data: createData, error: createError } = await supabaseAdmin.storage.createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (createError) {
      console.error('Error creating bucket:', createError);
      return NextResponse.json({ 
        error: 'Failed to create avatars bucket', 
        details: createError 
      }, { status: 500 });
    }

    console.log('✅ Avatars bucket created successfully');

    // Set up RLS policy for the bucket (allow authenticated users to upload)
    const { error: policyError } = await supabaseAdmin.rpc('create_storage_policy', {
      bucket_name: 'avatars',
      policy_name: 'Users can upload their own avatars',
      definition: `(bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)`
    });

    if (policyError) {
      console.warn('Warning: Could not create RLS policy:', policyError);
      // Continue anyway, as the bucket was created
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Avatars bucket created successfully',
      bucket: createData
    });

  } catch (error: any) {
    console.error('Setup storage error:', error);
    return NextResponse.json({ 
      error: 'Failed to setup storage', 
      details: error.message 
    }, { status: 500 });
  }
}
