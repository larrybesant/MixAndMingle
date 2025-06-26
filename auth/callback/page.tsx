'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processing OAuth callback...');
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Auth callback error:', error);
          router.push('/login?error=oauth_failed');
          return;
        }

        if (data.session?.user) {
          console.log('✅ OAuth successful! User:', data.session.user.id);
          
          // Check if user has a complete profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.session.user.id)
            .single();

          if (!profileData || !profileData.username || !profileData.bio) {
            // Redirect to profile creation
            router.push("/create-profile");
          } else {
            // Redirect to dashboard
            router.push("/dashboard");
          }
        } else {
          console.log('⚠️ No user session found');
          router.push('/login');
        }
      } catch (err) {
        console.error('💥 Callback processing error:', err);
        router.push('/login?error=callback_failed');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <p className="text-white text-lg">Completing sign in...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait while we set up your account</p>
      </div>
    </div>
  );
}
