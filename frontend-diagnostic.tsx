/**
 * 🔧 FRONTEND DIAGNOSTIC
 * Check if Supabase is properly initialized in the browser
 */

console.log('🔧 FRONTEND DIAGNOSTIC STARTING...');
console.log('====================================');

// Check environment variables
console.log('📊 Environment Variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');

// Check if window is available
console.log('\n🌐 Browser Environment:');
console.log('Window object:', typeof window !== 'undefined' ? '✅ Available' : '❌ Not available');
console.log('LocalStorage:', typeof window !== 'undefined' && window.localStorage ? '✅ Available' : '❌ Not available');

// Check Supabase client
try {
  const { supabase } = require('@/lib/supabase/client');
  console.log('\n🔗 Supabase Client:');
  console.log('Client object:', supabase ? '✅ Created' : '❌ Failed');
  
  if (supabase && supabase.auth) {
    console.log('Auth object:', '✅ Available');
    
    // Test basic auth function
    supabase.auth.getUser().then(({ data, error }: { data: any; error: any }) => {
      console.log('Auth test result:', error ? '❌ ' + error.message : '✅ Working');
    }).catch((err: any) => {
      console.log('Auth test error:', '❌ ' + err.message);
    });
    
  } else {
    console.log('Auth object:', '❌ Missing');
  }
  
} catch (err) {
  const message = (err && typeof err === 'object' && 'message' in err) ? (err as any).message : String(err);
  console.log('❌ Supabase import error:', message);
}

console.log('\n✅ Diagnostic complete - check above for issues');

export {}; // Make this a module
