#!/bin/bash

# 🚀 Email Authentication Production Deployment Script
# This script helps verify and deploy your email authentication system

echo "🔐 Mix & Mingle Email Authentication Deployment Checklist"
echo "==========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check environment variable
check_env_var() {
    local var_name=$1
    local required=$2
    
    if [ -z "${!var_name}" ]; then
        if [ "$required" = "true" ]; then
            echo -e "${RED}❌ $var_name not set (REQUIRED)${NC}"
            return 1
        else
            echo -e "${YELLOW}⚠️ $var_name not set (optional)${NC}"
            return 0
        fi
    else
        if [[ "${!var_name}" == *"xxxxxxxx"* ]] || [[ "${!var_name}" == *"placeholder"* ]]; then
            echo -e "${YELLOW}⚠️ $var_name appears to be a placeholder${NC}"
            return 1
        else
            echo -e "${GREEN}✅ $var_name configured${NC}"
            return 0
        fi
    fi
}

echo ""
echo "1️⃣ Checking prerequisites..."
echo "-----------------------------"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not installed${NC}"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm not installed${NC}"
    exit 1
fi

# Check if we're in a Next.js project
if [ -f "package.json" ]; then
    if grep -q "next" package.json; then
        echo -e "${GREEN}✅ Next.js project detected${NC}"
    else
        echo -e "${YELLOW}⚠️ This doesn't appear to be a Next.js project${NC}"
    fi
else
    echo -e "${RED}❌ package.json not found${NC}"
    exit 1
fi

echo ""
echo "2️⃣ Checking environment configuration..."
echo "----------------------------------------"

# Load environment variables if .env.local exists
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local found${NC}"
    # Export variables for this script (don't use 'set -a' as it affects the whole script)
    while IFS= read -r line || [[ -n "$line" ]]; do
        # Skip comments and empty lines
        if [[ $line =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
            continue
        fi
        # Export the variable
        if [[ $line =~ ^[[:space:]]*([^=]+)=(.*)$ ]]; then
            export "${BASH_REMATCH[1]}"="${BASH_REMATCH[2]}"
        fi
    done < .env.local
else
    echo -e "${RED}❌ .env.local not found${NC}"
    exit 1
fi

# Check required environment variables
ENV_CHECK_PASSED=true

if ! check_env_var "NEXT_PUBLIC_SUPABASE_URL" "true"; then ENV_CHECK_PASSED=false; fi
if ! check_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "true"; then ENV_CHECK_PASSED=false; fi
if ! check_env_var "SUPABASE_SERVICE_ROLE_KEY" "true"; then ENV_CHECK_PASSED=false; fi
if ! check_env_var "NEXT_PUBLIC_APP_URL" "true"; then ENV_CHECK_PASSED=false; fi
if ! check_env_var "RESEND_KEY" "false"; then
    echo -e "${YELLOW}   ℹ️ RESEND_KEY not configured - email features will be disabled${NC}"
fi

echo ""
echo "3️⃣ Checking project files..."
echo "----------------------------"

# Check for required files
FILES_TO_CHECK=(
    "lib/resend/client.ts"
    "lib/resend/templates.ts"
    "app/api/send-email/route.ts"
    "app/api/test-email/route.ts"
    "app/api/auth/signup/route.ts"
    "app/api/auth/reset-password/route.ts"
    "app/api/auth/callback/route.ts"
)

FILES_CHECK_PASSED=true

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file (missing)${NC}"
        FILES_CHECK_PASSED=false
    fi
done

echo ""
echo "4️⃣ Checking dependencies..."
echo "---------------------------"

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules exists${NC}"
else
    echo -e "${YELLOW}⚠️ node_modules not found - running npm install...${NC}"
    npm install
fi

# Check for specific dependencies
DEPS_TO_CHECK=("resend" "@supabase/supabase-js" "next")
DEPS_CHECK_PASSED=true

for dep in "${DEPS_TO_CHECK[@]}"; do
    if npm list "$dep" >/dev/null 2>&1; then
        VERSION=$(npm list "$dep" --depth=0 2>/dev/null | grep "$dep" | cut -d'@' -f2)
        echo -e "${GREEN}✅ $dep@$VERSION${NC}"
    else
        echo -e "${RED}❌ $dep (not installed)${NC}"
        DEPS_CHECK_PASSED=false
    fi
done

echo ""
echo "5️⃣ Building the application..."
echo "------------------------------"

# Try to build the application
echo "Building Next.js application..."
if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
    BUILD_PASSED=true
else
    echo -e "${RED}❌ Build failed${NC}"
    BUILD_PASSED=false
fi

echo ""
echo "6️⃣ Testing email authentication system..."
echo "-----------------------------------------"

# Start the application in background for testing
echo "Starting application for testing..."
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test the endpoints
TEST_PASSED=true

# Test email service endpoint
echo "Testing email service endpoint..."
if curl -s http://localhost:3000/api/test-email >/dev/null; then
    echo -e "${GREEN}✅ Email service endpoint responding${NC}"
else
    echo -e "${RED}❌ Email service endpoint not responding${NC}"
    TEST_PASSED=false
fi

# Test auth endpoints
echo "Testing auth endpoints..."
if curl -s http://localhost:3000/api/auth/signup >/dev/null; then
    echo -e "${GREEN}✅ Auth signup endpoint responding${NC}"
else
    echo -e "${RED}❌ Auth signup endpoint not responding${NC}"
    TEST_PASSED=false
fi

# Stop the test server
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo ""
echo "=========================================================="
echo "📊 DEPLOYMENT READINESS SUMMARY"
echo "=========================================================="

OVERALL_READY=true

if [ "$ENV_CHECK_PASSED" = true ]; then
    echo -e "${GREEN}✅ Environment Configuration${NC}"
else
    echo -e "${RED}❌ Environment Configuration${NC}"
    OVERALL_READY=false
fi

if [ "$FILES_CHECK_PASSED" = true ]; then
    echo -e "${GREEN}✅ Project Files${NC}"
else
    echo -e "${RED}❌ Project Files${NC}"
    OVERALL_READY=false
fi

if [ "$DEPS_CHECK_PASSED" = true ]; then
    echo -e "${GREEN}✅ Dependencies${NC}"
else
    echo -e "${RED}❌ Dependencies${NC}"
    OVERALL_READY=false
fi

if [ "$BUILD_PASSED" = true ]; then
    echo -e "${GREEN}✅ Application Build${NC}"
else
    echo -e "${RED}❌ Application Build${NC}"
    OVERALL_READY=false
fi

if [ "$TEST_PASSED" = true ]; then
    echo -e "${GREEN}✅ Basic Functionality${NC}"
else
    echo -e "${RED}❌ Basic Functionality${NC}"
    OVERALL_READY=false
fi

echo ""
if [ "$OVERALL_READY" = true ]; then
    echo -e "${GREEN}🚀 READY FOR DEPLOYMENT!${NC}"
    echo ""
    echo "Next steps for production:"
    echo "1. Deploy to your hosting platform (Vercel, Netlify, etc.)"
    echo "2. Update NEXT_PUBLIC_APP_URL to your production domain"
    echo "3. Configure custom domain in Resend dashboard"
    echo "4. Add DNS records for email delivery (SPF, DKIM)"
    echo "5. Test with real email addresses"
    echo "6. Monitor Resend dashboard for delivery analytics"
else
    echo -e "${RED}❌ NOT READY FOR DEPLOYMENT${NC}"
    echo ""
    echo "Please fix the issues above before deploying to production."
    echo ""
    echo "Common fixes:"
    echo "• Update environment variables in .env.local"
    echo "• Install missing dependencies: npm install"
    echo "• Fix TypeScript/build errors"
    echo "• Ensure all required files are present"
fi

echo ""
echo "📖 For detailed setup instructions, see:"
echo "   • EMAIL_AUTH_SETUP_COMPLETE.md"
echo "   • Test email system: node test-email-auth.js"
echo ""
echo "🔗 Useful links:"
echo "   • Resend Dashboard: https://resend.com/dashboard"
echo "   • Supabase Dashboard: https://supabase.com/dashboard"
echo "   • Next.js Deployment: https://nextjs.org/docs/deployment"
