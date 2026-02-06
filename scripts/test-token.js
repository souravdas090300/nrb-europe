#!/usr/bin/env node
require('dotenv').config({ path: '.env.dev' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2026-01-29',
  useCdn: false,
});

console.log('Testing Sanity API Token...\n');
console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET);
console.log('Token (first 15 chars):', process.env.SANITY_API_TOKEN?.substring(0, 15) + '...\n');

async function testToken() {
  try {
    console.log('Attempting to query documents...');
    const result = await client.fetch('*[_type == "user"][0...1]');
    console.log('✅ SUCCESS! Token is working.');
    console.log('Query returned:', result.length, 'documents');
    return true;
  } catch (error) {
    console.log('❌ FAILED! Token authentication error:');
    console.log('Error:', error.message);
    console.log('Status:', error.statusCode);
    console.log('\nDetails:', error.response?.body || error.details);
    return false;
  }
}

testToken().then(success => {
  if (!success) {
    console.log('\n' + '='.repeat(60));
    console.log('SOLUTION: Use Sanity Studio Browser Authentication');
    console.log('='.repeat(60));
    console.log('\nAPI tokens are not working. Use this instead:');
    console.log('  1. npm run dev');
    console.log('  2. Open http://localhost:3000/studio');
    console.log('  3. Sign in with your Sanity account');
    console.log('  4. Create admin user directly in the UI\n');
  }
  process.exit(success ? 0 : 1);
});
