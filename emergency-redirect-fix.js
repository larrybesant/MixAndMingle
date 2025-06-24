/**
 * EMERGENCY FIX: Unstick Login Redirect
 * Run this in browser console if stuck on "Redirecting..." screen
 */

console.log('🆘 Emergency Login Redirect Fix');

// Force redirect to dashboard
function forceRedirectToDashboard() {
  console.log('🔄 Forcing redirect to dashboard...');
  window.location.href = '/dashboard';
}

// Force logout and redirect to home
function forceLogoutAndReset() {
  console.log('🚪 Forcing logout and reset...');
  
  // Clear any stuck state
  localStorage.clear();
  sessionStorage.clear();
  
  // Force logout via API
  fetch('/api/auth/signout', { method: 'POST' })
    .then(() => {
      console.log('✅ Logged out successfully');
      window.location.href = '/';
    })
    .catch(() => {
      console.log('⚠️ Logout API failed, redirecting anyway');
      window.location.href = '/';
    });
}

// Check current auth state
async function checkAuthState() {
  console.log('🔍 Checking authentication state...');
  
  try {
    // Use Supabase to check auth
    if (window.supabase) {
      const { data: { user } } = await window.supabase.auth.getUser();
      console.log('👤 Current user:', user);
      
      if (user) {
        console.log('✅ User is authenticated');
        console.log('🎯 Forcing redirect to dashboard...');
        window.location.href = '/dashboard';
      } else {
        console.log('❌ No authenticated user found');
        console.log('🏠 Redirecting to home...');
        window.location.href = '/';
      }
    } else {
      console.log('⚠️ Supabase not available, forcing dashboard redirect');
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('❌ Auth check failed:', error);
    console.log('🔄 Forcing dashboard redirect anyway...');
    window.location.href = '/dashboard';
  }
}

// Quick fix functions
console.log(`
🆘 EMERGENCY FIXES AVAILABLE:

1. forceRedirectToDashboard() - Skip profile check, go to dashboard
2. forceLogoutAndReset() - Logout and start fresh  
3. checkAuthState() - Check auth and redirect appropriately

💡 RECOMMENDED: Run checkAuthState() first
`);

// Auto-run auth state check
console.log('🚀 Auto-running auth state check in 2 seconds...');
setTimeout(() => {
  checkAuthState();
}, 2000);
