#!/bin/bash
set -e

echo "🚀 NRB Europe Deployment Script"
echo "================================"

# Check environment
if [ -z "$1" ]; then
  echo "Usage: ./scripts/deploy.sh [staging|production]"
  exit 1
fi

ENV=$1
echo "📦 Deploying to: $ENV"

# Install dependencies
echo "📥 Installing dependencies..."
npm ci --legacy-peer-deps

# Generate Prisma client
echo "🗃️ Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗃️ Running database migrations..."
npx prisma migrate deploy

# Run tests
echo "🧪 Running tests..."
npm test

# Build
echo "🔨 Building application..."
npm run build

# Generate sitemap
echo "🗺️ Generating sitemap..."
npx next-sitemap

if [ "$ENV" = "production" ]; then
  echo "🌐 Deploying to Vercel (production)..."
  npx vercel --prod
else
  echo "🌐 Deploying to Vercel (preview)..."
  npx vercel
fi

echo "✅ Deployment complete!"
