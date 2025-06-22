#!/usr/bin/env node

// Test GET endpoint first to see if API is working
const fetch = require('node-fetch').default || require('node-fetch');

async function testGetEndpoint(baseUrl) {
  console.log(`\n🧪 Testing GET ${baseUrl}/api/auth/signup`);
  
  try {
    const response = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log(`📊 Status: ${response.status}`);
    console.log(`📄 Content-Type: ${response.headers.get('content-type')}`);
    
    const text = await response.text();
    console.log(`📄 Response (first 500 chars):`, text.substring(0, 500));
    
    try {
      const data = JSON.parse(text);
      console.log(`📄 Parsed JSON:`, JSON.stringify(data, null, 2));
    } catch (e) {
      console.log(`❌ Not valid JSON, raw response: ${text.substring(0, 200)}...`);
    }
    
    return { success: response.ok, status: response.status };
    
  } catch (error) {
    console.error('🚨 Error testing GET endpoint:', error.message);
    return { success: false, error: error.message };
  }
}

async function testEndpoints() {
  console.log('🔍 Testing GET endpoints first...\n');
  
  // Test deployed
  console.log('═══════════════════════════════════════');
  await testGetEndpoint('https://mix-and-mingle-nc86irjab-larrybesants-projects.vercel.app');
  
  console.log('\n═══════════════════════════════════════');
  console.log('🏁 Testing complete');
}

// Run the test
testEndpoints().catch(console.error);
