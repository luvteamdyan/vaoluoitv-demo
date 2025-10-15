#!/bin/bash

# Script để cài đặt Sanity dependencies cho Next.js
# Author: Luvmedia Dev Team
# Date: October 2025

set -e

echo "🚀 Installing Sanity dependencies for Next.js..."
echo ""

# Change to nextjs directory
NEXTJS_DIR="../nextjs"

if [ ! -d "$NEXTJS_DIR" ]; then
    echo "❌ Error: nextjs directory not found at $NEXTJS_DIR"
    exit 1
fi

cd "$NEXTJS_DIR"

echo "📦 Installing @sanity/client..."
npm install @sanity/client

echo "📦 Installing @sanity/image-url..."
npm install @sanity/image-url

echo "📦 Installing @sanity/types (dev dependency)..."
npm install -D @sanity/types

echo ""
echo "✅ All dependencies installed successfully!"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << 'EOF'
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=3mt74yqx
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
EOF
    echo "✅ .env.local created with Sanity configuration"
else
    echo "⚠️  .env.local already exists. Please add these lines manually:"
    echo ""
    echo "NEXT_PUBLIC_SANITY_PROJECT_ID=3mt74yqx"
    echo "NEXT_PUBLIC_SANITY_DATASET=production"
    echo "NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start Sanity Studio: cd ../studio-sanity && npm run dev"
echo "2. Start Next.js: npm run dev"
echo "3. Open http://localhost:3333 for Sanity Studio"
echo "4. Open http://localhost:8080 for Next.js app"
echo ""
echo "📚 Read the docs:"
echo "   - Setup: studio-sanity/docs/SETUP_INSTRUCTIONS.md"
echo "   - Management: studio-sanity/docs/ADS_MANAGEMENT_GUIDE.md"
echo "   - Integration: studio-sanity/docs/INTEGRATION_GUIDE.md"
echo ""

