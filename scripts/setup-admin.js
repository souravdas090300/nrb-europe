#!/usr/bin/env node

const { createClient } = require('@sanity/client');
// Don't load dotenv here - it's already loaded by run-setup.js

// Validate environment before creating client
if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  console.error('❌ NEXT_PUBLIC_SANITY_PROJECT_ID is not set');
  process.exit(1);
}

if (!process.env.SANITY_API_TOKEN) {
  console.error('❌ SANITY_API_TOKEN is not set');
  console.log('\n💡 Alternative: Use Sanity Studio browser authentication');
  console.log('   1. Run: npm run dev');
  console.log('   2. Visit: http://localhost:3000/studio');
  console.log('   3. Create documents directly in the Studio UI');
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2026-01-29',
  useCdn: false,
  // Add authentication headers
  requestTagPrefix: 'setup-admin',
});

async function setupAdminSystem() {
  console.log('🚀 Setting up NRB Europe Admin System...\n');
  
  try {
    // 1. Create initial admin user (if not exists)
    console.log('1. Checking for admin user...');
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nrbeurope.com';
    const existingUsers = await client.fetch('*[_type == "user" && email == $email]', { email: adminEmail });
    
    if (existingUsers.length === 0) {
      console.log('   Creating admin user...');
      await client.create({
        _type: 'user',
        name: 'Super Admin',
        email: adminEmail,
        role: 'superAdmin',
        isActive: true,
        position: 'administrator',
        articleCount: 0,
      });
      console.log('   ✅ Admin user created');
    } else {
      console.log('   ✅ Admin user exists');
    }
    
    // 2. Create default categories
    console.log('\n2. Setting up default categories...');
    
    const defaultCategories = [
      { title: 'Politics', slug: 'politics', description: 'Political news and analysis' },
      { title: 'Business', slug: 'business', description: 'Business and financial news' },
      { title: 'Sports', slug: 'sports', description: 'Sports news and updates' },
      { title: 'Technology', slug: 'technology', description: 'Tech news and innovations' },
      { title: 'Health', slug: 'health', description: 'Health and medical news' },
      { title: 'Entertainment', slug: 'entertainment', description: 'Entertainment news' },
      { title: 'World', slug: 'world', description: 'International news' },
      { title: 'Europe', slug: 'europe', description: 'European affairs' },
    ];
    
    for (const category of defaultCategories) {
      const existing = await client.fetch('*[_type == "category" && slug.current == $slug]', { slug: category.slug });
      
      if (existing.length === 0) {
        await client.create({
          _type: 'category',
          title: category.title,
          description: category.description,
          slug: { current: category.slug, _type: 'slug' },
        });
        console.log(`   Created: ${category.title}`);
      } else {
        console.log(`   Exists: ${category.title}`);
      }
    }
    
    // 3. Check environment variables
    console.log('\n3. Checking environment variables...');
    
    const requiredEnvVars = [
      'NEXT_PUBLIC_SANITY_PROJECT_ID',
      'NEXT_PUBLIC_SANITY_DATASET',
      'SANITY_API_TOKEN',
      'NEXT_PUBLIC_BASE_URL',
    ];
    
    let missingVars = [];
    for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }
    
    if (missingVars.length > 0) {
      console.log(`   ⚠️  Missing environment variables: ${missingVars.join(', ')}`);
      console.log('   Please add them to .env.local file');
    } else {
      console.log('   ✅ All required environment variables are set');
    }
    
    // 4. Webhook setup reminder
    console.log('\n4. Webhook Configuration:');
    console.log('   Note: Webhooks need to be configured in sanity.io/manage');
    console.log(`   URL: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/api/webhooks/breaking-news`);
    console.log('   Trigger: On create/update with isBreakingNews == true');
    console.log('   Secret: Set SANITY_WEBHOOK_SECRET in environment variables');
    
    console.log('\n🎉 Admin system setup complete!');
    console.log('\nNext steps:');
    console.log('1. Deploy your schema: npm run deploy-schema');
    console.log('2. Configure webhooks at: https://sanity.io/manage');
    console.log('3. Access your studio at: /studio');
    console.log('4. Create additional users through the Studio UI');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupAdminSystem();
