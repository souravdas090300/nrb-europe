// Load only .env.dev, ignore all other env files
process.env.DOTENV_CONFIG_PATH = '.env.dev';

// Disable dotenv from automatically loading .env.local
const dotenv = require('dotenv');
const path = require('path');

// Clear any existing env vars and load only .env.dev
const result = dotenv.config({ 
  path: path.resolve(process.cwd(), '.env.dev'),
  override: true
});

if (result.error) {
  console.error('Failed to load .env.dev:', result.error);
  process.exit(1);
}

console.log('✓ Loaded environment from .env.dev only');

// Run the setup script
require('./scripts/setup-admin.js');
