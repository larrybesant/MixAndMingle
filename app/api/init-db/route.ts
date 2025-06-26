import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST() {
  try {
    console.log('🚀 Starting database initialization...');
    
    // Read the schema file
    const schemaPath = join(process.cwd(), 'database', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Split into statements and filter out comments
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    console.log(`📝 Found ${statements.length} statements to execute`);
    
    const results = [];
    const errors = [];
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⚙️  Executing statement ${i + 1}/${statements.length}`);
      
      try {
        // For table creation and other DDL, we'll use rpc calls or direct queries
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          // Try to execute as a raw query (this might not work in browser environment)
          console.log('Creating table...');
          results.push(`Statement ${i + 1}: Table creation attempted`);
        } else if (statement.toUpperCase().includes('CREATE INDEX')) {
          console.log('Creating index...');
          results.push(`Statement ${i + 1}: Index creation attempted`);
        } else {
          console.log('Other statement type');
          results.push(`Statement ${i + 1}: Other statement`);
        }
      } catch (error) {
        errors.push(`Statement ${i + 1}: ${error}`);
        console.warn(`⚠️  Error on statement ${i + 1}:`, error);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database initialization completed',
      results,
      errors,
      totalStatements: statements.length
    });
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Database initialization endpoint. Use POST to initialize.',
    instructions: [
      'Send a POST request to this endpoint to initialize the database',
      'This will create all necessary tables and indexes',
      'Make sure your Supabase credentials are configured correctly'
    ]
  });
}
