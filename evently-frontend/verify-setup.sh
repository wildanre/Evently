#!/bin/bash

# CI/CD Setup Verification Script for Evently Frontend
# This script helps verify that your CI/CD setup is ready for deployment

echo "🔍 Evently Frontend CI/CD Setup Verification"
echo "============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "next.config.ts" ]; then
    echo "❌ Please run this script from the evently-frontend directory"
    exit 1
fi

echo "✅ Directory check passed"

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it: npm install -g pnpm"
    exit 1
fi

echo "✅ pnpm is available"

# Check if all required files exist
echo ""
echo "📁 Checking required files..."

required_files=(
    ".env"
    "package.json"
    "next.config.ts"
    "../.github/workflows/deploy-frontend.yml"
    "vercel.json"
    ".lighthouserc.json"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
    fi
done

# Check environment variables in .env file
echo ""
echo "🔐 Checking environment variables..."

if [ -f ".env" ]; then
    required_vars=(
        "NEXT_PUBLIC_API_URL"
        "NEXT_PUBLIC_API_BASE_URL"
        "NEXTAUTH_SECRET"
        "NEXTAUTH_URL"
        "GOOGLE_CLIENT_ID"
        "GOOGLE_CLIENT_SECRET"
        "DATABASE_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env; then
            echo "✅ $var is set in .env"
        else
            echo "❌ $var is missing from .env"
        fi
    done
else
    echo "❌ .env file not found"
fi

# Check if dependencies can be installed
echo ""
echo "📦 Testing dependency installation..."
if pnpm install --frozen-lockfile &> /dev/null; then
    echo "✅ Dependencies install successfully"
else
    echo "❌ Failed to install dependencies"
fi

# Check if project builds
echo ""
echo "🔨 Testing build process..."
if pnpm run build &> /dev/null; then
    echo "✅ Project builds successfully"
else
    echo "❌ Build failed - check for errors"
fi

# Check if tests can run
echo ""
echo "🧪 Testing test suite..."
if pnpm run test:ci &> /dev/null; then
    echo "✅ Tests run successfully"
else
    echo "❌ Tests failed - check test configuration"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Set up GitHub repository secrets (see CI_CD_SETUP_SUMMARY.md)"
echo "2. Configure Vercel environment variables"
echo "3. Test the pipeline by creating a pull request"
echo "4. Monitor your first deployment"

echo ""
echo "📚 For detailed instructions, see: CI_CD_SETUP_SUMMARY.md"
