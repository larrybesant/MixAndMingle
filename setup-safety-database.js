#!/usr/bin/env node

/**
 * Database Setup Script for Safety System
 * This script helps set up the safety system database schema
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure you have set:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupSafetyDatabase() {
  console.log('🔧 Setting up Safety System Database...\n');

  try {
    // Read the safety schema file
    const schemaPath = path.join(__dirname, 'database', 'safety-schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error('Safety schema file not found: ' + schemaPath);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📖 Schema file loaded successfully');
    console.log('📊 Setting up the following tables:');
    console.log('   • community_reports');
    console.log('   • moderation_actions');
    console.log('   • user_moderation');
    console.log('   • guidelines_acceptance');
    console.log('   • age_verification');
    console.log('   • user_trust_scores');
    console.log('   • safety_incidents');
    console.log('   • emergency_contacts');
    console.log('');

    // Split the SQL into individual statements
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`🔨 Executing ${statements.length} SQL statements...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.includes('CREATE TABLE') || 
          statement.includes('CREATE INDEX') || 
          statement.includes('ALTER TABLE') ||
          statement.includes('CREATE POLICY') ||
          statement.includes('CREATE FUNCTION') ||
          statement.includes('CREATE TRIGGER')) {
        
        try {
          const { error } = await supabase.rpc('exec', { query: statement });
          
          if (error) {
            console.log(`❌ Error in statement ${i + 1}: ${error.message}`);
            errorCount++;
          } else {
            const type = statement.includes('CREATE TABLE') ? 'TABLE' :
                        statement.includes('CREATE INDEX') ? 'INDEX' :
                        statement.includes('ALTER TABLE') ? 'ALTER' :
                        statement.includes('CREATE POLICY') ? 'POLICY' :
                        statement.includes('CREATE FUNCTION') ? 'FUNCTION' :
                        statement.includes('CREATE TRIGGER') ? 'TRIGGER' : 'SQL';
            
            console.log(`✅ ${type} created successfully`);
            successCount++;
          }
        } catch (err) {
          console.log(`❌ Exception in statement ${i + 1}: ${err.message}`);
          errorCount++;
        }
      }
    }

    console.log('\n📊 Setup Summary:');
    console.log(`   ✅ Successful operations: ${successCount}`);
    console.log(`   ❌ Failed operations: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n🎉 Safety system database setup completed successfully!');
      
      // Test the setup
      console.log('\n🧪 Testing database setup...');
      await testDatabaseSetup();
      
    } else {
      console.log('\n⚠️  Some operations failed. Please check the errors above.');
      console.log('You may need to run the SQL manually in your Supabase dashboard.');
    }

  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    
    // Provide manual instructions
    console.log('\n📋 Manual Setup Instructions:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to the SQL Editor');
    console.log('3. Copy and paste the contents of database/safety-schema.sql');
    console.log('4. Run the SQL script');
    console.log('5. Verify tables were created in the Table Editor');
    
    process.exit(1);
  }
}

async function testDatabaseSetup() {
  const tables = [
    'community_reports',
    'moderation_actions',
    'user_moderation', 
    'guidelines_acceptance',
    'age_verification',
    'user_trust_scores',
    'safety_incidents',
    'emergency_contacts'
  ];

  let allTablesExist = true;

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        console.log(`   ❌ Table ${table}: ${error.message}`);
        allTablesExist = false;
      } else {
        console.log(`   ✅ Table ${table}: OK`);
      }
    } catch (error) {
      console.log(`   ❌ Table ${table}: ${error.message}`);
      allTablesExist = false;
    }
  }

  if (allTablesExist) {
    console.log('\n🎯 All safety system tables are working correctly!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Visit: http://localhost:3000/safety');
    console.log('3. Test the safety features');
    console.log('4. Submit a test report');
    console.log('5. Try blocking/muting functionality');
  } else {
    console.log('\n❌ Some tables are not working correctly.');
    console.log('Please check your Supabase dashboard and ensure all tables were created.');
  }
}

// Execute the setup
if (require.main === module) {
  setupSafetyDatabase()
    .catch(error => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupSafetyDatabase };
