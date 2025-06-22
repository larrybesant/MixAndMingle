import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  console.log('🔄 OAuth callback route hit');
  
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  console.log('OAuth callback params:', { code: !!code, error, error_description, next });

  if (error) {
    console.error('❌ OAuth error:', error, error_description);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_description || error)}`);
  }

  if (code) {
    console.log('🔑 Processing OAuth code...');
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('❌ Code exchange error:', exchangeError);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`);
      }

      if (data.user) {
        console.log('✅ OAuth login successful:', data.user.id);
        
        // Check if user has complete profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        console.log('Profile check:', { hasProfile: !!profileData, hasUsername: !!profileData?.username });

        if (!profileData || !profileData.username || !profileData.bio) {
          console.log('🔧 Redirecting to profile creation');
          return NextResponse.redirect(`${origin}/create-profile`);
        } else {
          console.log('📊 Redirecting to dashboard');
          return NextResponse.redirect(`${origin}${next}`);
        }
      }
    } catch (err) {
      console.error('💥 OAuth callback error:', err);
      return NextResponse.redirect(`${origin}/login?error=oauth_callback_failed`);
    }
  }

  console.log('⚠️ No code or error in OAuth callback');
  return NextResponse.redirect(`${origin}/login?error=no_oauth_code`);
}
