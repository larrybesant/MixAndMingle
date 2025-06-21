import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { subscription } = await req.json();
  // Get access token from cookies (if using Supabase Auth)
  const access_token = req.cookies.get('sb-access-token')?.value;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: access_token ? `Bearer ${access_token}` : '' } } }
  );
  // Get user session
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // Save subscription to Supabase
  const { endpoint, keys } = subscription;
  const { error } = await supabase.from('push_subscriptions').upsert({
    user_id: user.id,
    endpoint,
    keys,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
