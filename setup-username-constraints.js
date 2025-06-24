import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create admin client with service role key for database modifications
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function addUsernameConstraints() {
  console.log('🔧 Adding username uniqueness constraints...');

  try {
    // First, check for duplicate usernames
    console.log('📊 Checking for duplicate usernames...');
    const { data: duplicates, error: dupError } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .not('username', 'is', null);

    if (dupError) {
      console.error('Error checking duplicates:', dupError);
      return;
    }

    // Group by lowercase username to find duplicates
    const usernameCounts = {};
    duplicates?.forEach(profile => {
      const lower = profile.username?.toLowerCase();
      if (lower) {
        usernameCounts[lower] = (usernameCounts[lower] || 0) + 1;
      }
    });

    const duplicateUsernames = Object.entries(usernameCounts)
      .filter(([_, count]) => count > 1)
      .map(([username]) => username);

    if (duplicateUsernames.length > 0) {
      console.log('⚠️  Found duplicate usernames (case-insensitive):', duplicateUsernames);
      console.log('You may need to clean these up manually before adding constraints.');
    } else {
      console.log('✅ No duplicate usernames found');
    }

    // Add the unique constraint using raw SQL
    console.log('🔨 Adding unique username constraint...');
    
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        -- Add unique constraint on lowercase username
        ALTER TABLE profiles 
        ADD CONSTRAINT unique_username_lowercase 
        UNIQUE (LOWER(username));

        -- Create index for faster username lookups
        CREATE INDEX IF NOT EXISTS idx_profiles_username_lower 
        ON profiles (LOWER(username));
      `
    });

    if (error) {
      console.error('❌ Error adding constraint:', error);
      
      // If exec_sql doesn't work, let's try a different approach
      console.log('🔄 Trying alternative approach...');
      
      // Check if constraint already exists
      const { data: constraints, error: constError } = await supabaseAdmin
        .from('information_schema.table_constraints')
        .select('constraint_name')
        .eq('table_name', 'profiles')
        .eq('constraint_name', 'unique_username_lowercase');

      if (constError) {
        console.error('Error checking constraints:', constError);
      } else if (constraints && constraints.length > 0) {
        console.log('✅ Constraint already exists');
      } else {
        console.log('⚠️  Could not add constraint via RPC. Please run the SQL manually in Supabase.');
        console.log('SQL to run:');
        console.log(`
ALTER TABLE profiles 
ADD CONSTRAINT unique_username_lowercase 
UNIQUE (LOWER(username));

CREATE INDEX IF NOT EXISTS idx_profiles_username_lower 
ON profiles (LOWER(username));
        `);
      }
    } else {
      console.log('✅ Username uniqueness constraint added successfully');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Run the script
addUsernameConstraints()
  .then(() => {
    console.log('🎉 Username constraint setup complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Script failed:', err);
    process.exit(1);
  });
