#!/bin/bash

# Mix & Mingle - Quick Deployment Script
# This script helps you deploy your app to production quickly

echo "🎵 Mix & Mingle - Quick Deployment 🎵"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from your project root directory"
    exit 1
fi

# Check if Node.js is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: Node.js/npm is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check environment variables
echo ""
echo "🔧 Checking environment configuration..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local file not found"
    echo "Please create .env.local with your Supabase and Daily.co credentials"
    echo ""
    echo "Required variables:"
    echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    echo "DAILY_API_KEY=your_daily_api_key"
    echo ""
    read -p "Press Enter when you've created .env.local..."
fi

# Run type checking
echo ""
echo "🔍 Running TypeScript check..."
npm run type-check || {
    echo "❌ TypeScript errors found. Please fix them before deploying."
    exit 1
}

# Run build test
echo ""
echo "🏗️  Testing production build..."
npm run build || {
    echo "❌ Build failed. Please fix the errors before deploying."
    exit 1
}

echo ""
echo "✅ Build successful!"
echo ""

# Check if user wants to deploy to Vercel
echo "🚀 Ready to deploy!"
echo ""
echo "Deployment options:"
echo "1. Deploy to Vercel (recommended)"
echo "2. Manual deployment instructions"
echo "3. Test locally first"
echo ""

read -p "Choose an option (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🌐 Deploying to Vercel..."
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        
        echo ""
        echo "Starting Vercel deployment..."
        echo "1. Follow the prompts to connect your GitHub repo"
        echo "2. Set up your project name"
        echo "3. Add environment variables in Vercel dashboard"
        echo ""
        
        vercel --prod
        ;;
    
    2)
        echo ""
        echo "📋 Manual Deployment Instructions:"
        echo ""
        echo "1. Push your code to GitHub:"
        echo "   git add ."
        echo "   git commit -m 'Deploy Mix & Mingle MVP'"
        echo "   git push origin main"
        echo ""
        echo "2. Go to https://vercel.com/dashboard"
        echo "3. Click 'New Project' and import your GitHub repo"
        echo "4. Set environment variables in Vercel dashboard:"
        echo "   - NEXT_PUBLIC_SUPABASE_URL"
        echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo "   - SUPABASE_SERVICE_ROLE_KEY"
        echo "   - DAILY_API_KEY"
        echo "5. Deploy!"
        echo ""
        ;;
    
    3)
        echo ""
        echo "🧪 Starting local production server..."
        echo "Visit http://localhost:3000 to test your app"
        echo "Press Ctrl+C to stop"
        echo ""
        npm start
        ;;
    
    *)
        echo "Invalid option. Exiting..."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Test your deployed app thoroughly"
echo "2. Set up your Supabase database (visit /mvp for setup tools)"
echo "3. Invite beta users to test"
echo "4. Monitor performance and gather feedback"
echo ""
echo "🎵 Your Mix & Mingle app is live! 🎵"
