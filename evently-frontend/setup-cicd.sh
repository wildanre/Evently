#!/bin/bash

# CI/CD Setup Helper Script for Evently Frontend
# This script helps automate the setup of Vercel and GitHub secrets

set -e

echo "🚀 Evently Frontend CI/CD Setup Helper"
echo "=====================================\n"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "\n${BLUE}[STEP]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the evently-frontend directory"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Step 1: Login to Vercel
print_step "1. Vercel Login"
print_status "Please login to Vercel if you haven't already"
vercel login

# Step 2: Link project to Vercel
print_step "2. Link Project to Vercel"
if [ ! -d ".vercel" ]; then
    print_status "Linking project to Vercel..."
    vercel link
else
    print_status "Project already linked to Vercel"
fi

# Step 3: Get Project Information
print_step "3. Extract Project Information"
if [ -f ".vercel/project.json" ]; then
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*' | cut -d'"' -f4)
    ORG_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*' | cut -d'"' -f4)
    
    print_status "Project ID: $PROJECT_ID"
    print_status "Org ID: $ORG_ID"
else
    print_error "Could not find .vercel/project.json. Please run 'vercel link' first."
    exit 1
fi

# Step 4: Generate secrets information
print_step "4. GitHub Secrets Configuration"
echo -e "\n${YELLOW}Add these secrets to your GitHub repository:${NC}"
echo "Go to: Settings > Secrets and variables > Actions > New repository secret"
echo ""
echo "VERCEL_TOKEN=<your_vercel_token>"
echo "VERCEL_ORG_ID=$ORG_ID"
echo "VERCEL_PROJECT_ID=$PROJECT_ID"
echo ""
echo "NEXT_PUBLIC_API_URL=<your_backend_api_url>"
echo "NEXT_PUBLIC_API_BASE_URL=<your_backend_base_url>"
echo "NEXTAUTH_SECRET=<your_nextauth_secret>"
echo "NEXTAUTH_URL=<your_production_url>"
echo "GOOGLE_CLIENT_ID=<your_google_client_id>"
echo "GOOGLE_CLIENT_SECRET=<your_google_client_secret>"

# Step 5: Generate Vercel token instructions
print_step "5. Create Vercel Token"
echo -e "\n${YELLOW}To create a Vercel token:${NC}"
echo "1. Go to https://vercel.com/account/tokens"
echo "2. Click 'Create Token'"
echo "3. Name it 'GitHub Actions'"
echo "4. Copy the token and add it as VERCEL_TOKEN in GitHub Secrets"

# Step 6: Environment variables setup
print_step "6. Environment Variables Setup"
if [ -f ".env.local" ]; then
    print_status "Found .env.local file"
    echo -e "\n${YELLOW}Current environment variables:${NC}"
    cat .env.local | grep -E "^[A-Z]" | sed 's/=.*/=<redacted>/' || true
else
    print_warning "No .env.local file found"
    echo "Create .env.local with your environment variables"
fi

# Step 7: Test build
print_step "7. Test Build"
print_status "Running test build to verify configuration..."
if npm run build; then
    print_status "✅ Build successful!"
else
    print_error "❌ Build failed. Please check your configuration."
    exit 1
fi

# Step 8: Summary
print_step "8. Summary"
echo -e "\n${GREEN}Setup completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Add all secrets to GitHub repository"
echo "2. Create a pull request to test preview deployment"
echo "3. Merge to main/master for production deployment"
echo ""
echo "Documentation: CI_CD_SETUP_GUIDE.md"
echo "Workflow file: .github/workflows/deploy-frontend.yml"
echo ""
echo "🎉 Your CI/CD pipeline is ready!"
