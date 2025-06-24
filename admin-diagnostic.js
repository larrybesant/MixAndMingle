/**
 * 🔍 ADMIN ACCOUNT DIAGNOSTIC & RESET
 * Check admin account status and force password reset
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ywfjmsbyksehjgwalqum.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zmptc2J5a3NlaGpnd2FscXVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzMzMjA2OCwiZXhwIjoyMDYyOTA4MDY4fQ.yCEJpiyVvEZeyrb9SPfmEwwpWcB_UnQ9v51uefyEw_c'
);

async function adminDiagnostic() {
  console.log('🔍 ADMIN ACCOUNT DIAGNOSTIC');
  console.log('=' .repeat(40));
  
  const adminEmail = 'larrybesant@gmail.com';
  
  try {
    // Check if user exists
    console.log('📧 Checking admin account...');
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error checking users:', listError.message);
      return;
    }
    
    const adminUser = users.users.find(user => user.email === adminEmail);
    
    if (adminUser) {
      console.log('✅ ADMIN ACCOUNT FOUND!');
      console.log('📧 Email:', adminUser.email);
      console.log('🆔 ID:', adminUser.id);
      console.log('📅 Created:', adminUser.created_at);
      console.log('✉️ Email confirmed:', adminUser.email_confirmed_at ? 'Yes' : 'No');
      console.log('🔑 Last sign in:', adminUser.last_sign_in_at || 'Never');
      
      // Try to send password reset
      console.log('\n🔄 Sending password reset...');
      const { error: resetError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: adminEmail,
      });
      
      if (resetError) {
        console.log('⚠️ Reset email issue:', resetError.message);
        console.log('\n🔧 MANUAL SOLUTIONS:');
        console.log('1. Set new password directly via Supabase dashboard');
        console.log('2. Try common passwords you might have used');
        console.log('3. Create new temporary password');
      } else {
        console.log('✅ Password reset sent! Check your email (including spam)');
      }
      
      // Provide manual password reset option
      console.log('\n🛠️ MANUAL PASSWORD RESET OPTION:');
      const newPassword = 'MixMingle2024!';
      console.log('Setting temporary password...');
      
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        { password: newPassword }
      );
      
      if (updateError) {
        console.log('❌ Could not set temporary password:', updateError.message);
      } else {
        console.log('✅ TEMPORARY PASSWORD SET!');
        console.log('🔑 Email: larrybesant@gmail.com');
        console.log('🔑 Password: MixMingle2024!');
        console.log('');
        console.log('🎯 LOGIN NOW:');
        console.log('1. Go to: http://localhost:3000/login');
        console.log('2. Use credentials above');
        console.log('3. Access admin: http://localhost:3000/admin');
        console.log('4. Change password in your profile');
      }
      
    } else {
      console.log('❌ Admin account not found');
      console.log('🔧 Creating new admin account...');
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: 'MixMingle2024!',
        email_confirm: true
      });
      
      if (error) {
        console.error('❌ Error creating admin:', error.message);
      } else {
        console.log('✅ NEW ADMIN ACCOUNT CREATED!');
        console.log('🔑 Email: larrybesant@gmail.com');
        console.log('🔑 Password: MixMingle2024!');
      }
    }
    
  } catch (err) {
    console.error('❌ Diagnostic failed:', err.message);
  }
}

adminDiagnostic();
