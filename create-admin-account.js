/**
 * 🔧 ADMIN ACCOUNT SETUP
 * Create admin account directly via Supabase
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ywfjmsbyksehjgwalqum.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zmptc2J5a3NlaGpnd2FscXVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzMzMjA2OCwiZXhwIjoyMDYyOTA4MDY4fQ.yCEJpiyVvEZeyrb9SPfmEwwpWcB_UnQ9v51uefyEw_c'
);

async function createAdminAccount() {
  console.log('🔧 CREATING ADMIN ACCOUNT');
  console.log('=' .repeat(40));
  
  const adminEmail = 'larrybesant@gmail.com';
  const adminPassword = 'AdminPass123!'; // You can change this after
  
  try {
    // Create admin user
    console.log('📧 Creating admin account...');
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true // Skip email confirmation
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ Admin account already exists!');
        console.log('🔑 Try logging in with your existing password');
        console.log('📧 Or use Supabase dashboard to reset password');
        return;
      }
      console.error('❌ Error creating admin:', error.message);
      return;
    }
    
    console.log('✅ ADMIN ACCOUNT CREATED SUCCESSFULLY!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('');
    console.log('🎯 NOW YOU CAN:');
    console.log('1. Go to: http://localhost:3000/login');
    console.log('2. Login with the credentials above');
    console.log('3. Access admin at: http://localhost:3000/admin');
    console.log('');
    console.log('⚠️ CHANGE YOUR PASSWORD AFTER FIRST LOGIN!');
    
  } catch (err) {
    console.error('❌ Failed to create admin account:', err.message);
    console.log('');
    console.log('🔄 ALTERNATIVE SOLUTIONS:');
    console.log('1. Check Supabase dashboard for existing user');
    console.log('2. Reset password via Supabase dashboard');
    console.log('3. Check email spam folder');
  }
}

createAdminAccount();
