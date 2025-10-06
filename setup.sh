#!/bin/bash

# Hotte Couture - Quick Setup Script
# This script helps set up the development environment

set -e

echo "🎯 Hotte Couture - Quick Setup"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    echo "   Please upgrade Node.js"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo ""
    echo "⚠️  .env.local file not found"
    echo "   Creating template..."
    
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Pricing Configuration
RUSH_FEE_SMALL_CENTS=3000
RUSH_FEE_LARGE_CENTS=6000
GST_PST_RATE_BPS=1200

# Optional: Custom configuration
CUSTOM_KEY=your_custom_key
EOF
    
    echo "✅ Created .env.local template"
    echo "   Please update the Supabase configuration in .env.local"
else
    echo "✅ .env.local file found"
fi

# Check if Supabase CLI is available
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI detected"
    echo ""
    echo "🗄️  Database setup options:"
    echo "   1. Run 'supabase db reset' to reset database"
    echo "   2. Or manually run migrations in Supabase dashboard"
else
    echo "⚠️  Supabase CLI not found"
    echo "   You can install it with: npm install -g supabase"
    echo "   Or manually run migrations in Supabase dashboard"
fi

echo ""
echo "🚀 Setup complete! Next steps:"
echo ""
echo "1. Update .env.local with your Supabase credentials"
echo "2. Run database migrations (see SETUP.md for details)"
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "📖 For detailed instructions, see SETUP.md"
echo ""
echo "🎉 Happy coding!"
