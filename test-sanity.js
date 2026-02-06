// Test if the Sanity API token works
require('dotenv').config({ path: '.env.dev', override: true });

const { createClient } = require('@sanity/client');

console.log('Testing Sanity connection...\n');
console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET);
console.log('Token starts with:', process.env.SANITY_API_TOKEN?.substring(0, 10) + '...');
console.log('Token length:', process.env.SANITY_API_TOKEN?.length);
console.log('');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2026-01-29',
  useCdn: false,
});

async function testConnection() {
  try {
    console.log('Attempting to fetch documents...');
    const result = await client.fetch('*[0..2]{_id, _type}');
    console.log('✅ Connection successful!');
    console.log('Found documents:', result);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', error);
  }
}

testConnection();
