#!/bin/bash

# Evently Frontend CI/CD Setup Script
# This script helps setup the CI/CD pipeline for deploying to Vercel

set -e

echo "🚀 Evently Frontend CI/CD Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "evently-frontend/package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the root of the Evently project${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Checking prerequisites...${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
else
    echo -e "${GREEN}✅ Vercel CLI found${NC}"
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI not found. Please install it from https://cli.github.com/${NC}"
    echo -e "${YELLOW}   You can also set secrets manually in GitHub repository settings${NC}"
fi

cd evently-frontend

echo -e "${BLUE}🔗 Setting up Vercel project...${NC}"

# Check if already linked
if [ ! -f ".vercel/project.json" ]; then
    echo -e "${YELLOW}📡 Linking to Vercel project...${NC}"
    vercel link
else
    echo -e "${GREEN}✅ Project already linked to Vercel${NC}"
fi

# Get project info
if [ -f ".vercel/project.json" ]; then
    ORG_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*' | cut -d'"' -f4)
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*' | cut -d'"' -f4)
    
    echo -e "${GREEN}📊 Project Information:${NC}"
    echo -e "   Org ID: ${ORG_ID}"
    echo -e "   Project ID: ${PROJECT_ID}"
else
    echo -e "${RED}❌ Failed to get project information${NC}"
    exit 1
fi

echo -e "${BLUE}🔑 Setting up environment variables...${NC}"

# Function to add environment variable to Vercel
add_env_var() {
    local var_name=$1
    local environment=$2
    
    echo -e "${YELLOW}🔧 Please enter value for ${var_name} (${environment}):${NC}"
    read -r var_value
    
    if [ ! -z "$var_value" ]; then
        echo "$var_value" | vercel env add "$var_name" "$environment"
        echo -e "${GREEN}✅ Added ${var_name} to ${environment}${NC}"
    else
        echo -e "${YELLOW}⚠️  Skipped ${var_name}${NC}"
    fi
}

# Environment variables to set
ENV_VARS=(
    "NEXT_PUBLIC_API_URL"
    "NEXT_PUBLIC_API_BASE_URL"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
    "GOOGLE_CLIENT_ID"
    "GOOGLE_CLIENT_SECRET"
)

echo -e "${BLUE}🌍 Setting up PRODUCTION environment variables...${NC}"
for var in "${ENV_VARS[@]}"; do
    add_env_var "$var" "production"
done

echo -e "${BLUE}🔍 Setting up PREVIEW environment variables...${NC}"
for var in "${ENV_VARS[@]}"; do
    add_env_var "$var" "preview"
done

cd ..

echo -e "${BLUE}🔐 GitHub Secrets Setup${NC}"
echo -e "${YELLOW}📝 You need to add these secrets to your GitHub repository:${NC}"
echo ""
echo -e "${GREEN}Required GitHub Secrets:${NC}"
echo -e "   VERCEL_TOKEN: [Your Vercel Token]"
echo -e "   VERCEL_ORG_ID: ${ORG_ID}"
echo -e "   VERCEL_PROJECT_ID: ${PROJECT_ID}"
echo ""
echo -e "${GREEN}Environment Variables (from your .env file):${NC}"
echo -e "   NEXTAUTH_SECRET: [Your NextAuth Secret]"
echo -e "   GOOGLE_CLIENT_ID: [Your Google OAuth Client ID]"
echo -e "   GOOGLE_CLIENT_SECRET: [Your Google OAuth Client Secret]"
echo -e "   DATABASE_URL: [Your Database Connection String]"

# Try to set GitHub secrets if GitHub CLI is available
if command -v gh &> /dev/null; then
    echo ""
    echo -e "${BLUE}🤖 Would you like to set GitHub secrets automatically? (y/n)${NC}"
    read -r auto_setup
    
    if [ "$auto_setup" = "y" ] || [ "$auto_setup" = "Y" ]; then
        echo -e "${YELLOW}🔑 Setting up GitHub secrets...${NC}"
        echo -e "${YELLOW}Please enter your values when prompted${NC}"
        
        # Vercel secrets
        echo -e "${YELLOW}Enter VERCEL_TOKEN:${NC}"
        read -s vercel_token
        gh secret set VERCEL_TOKEN --body "$vercel_token"
        
        gh secret set VERCEL_ORG_ID --body "$ORG_ID"
        gh secret set VERCEL_PROJECT_ID --body "$PROJECT_ID"
        
        # Environment variables
        echo -e "${YELLOW}Enter NEXTAUTH_SECRET:${NC}"
        read -s nextauth_secret
        gh secret set NEXTAUTH_SECRET --body "$nextauth_secret"
        
        echo -e "${YELLOW}Enter GOOGLE_CLIENT_ID:${NC}"
        read -r google_client_id
        gh secret set GOOGLE_CLIENT_ID --body "$google_client_id"
        
        echo -e "${YELLOW}Enter GOOGLE_CLIENT_SECRET:${NC}"
        read -s google_client_secret
        gh secret set GOOGLE_CLIENT_SECRET --body "$google_client_secret"
        
        echo -e "${YELLOW}Enter DATABASE_URL:${NC}"
        read -s database_url
        gh secret set DATABASE_URL --body "$database_url"
        
        echo -e "${GREEN}✅ All GitHub secrets have been set!${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "   1. Verify all secrets are set in GitHub: Settings → Secrets and variables → Actions"
echo -e "   2. Push changes to trigger the pipeline"
echo -e "   3. Create a Pull Request to test preview deployments"
echo -e "   4. Monitor deployments in GitHub Actions and Vercel dashboard"
echo ""
echo -e "${BLUE}📊 Useful URLs:${NC}"
echo -e "   GitHub Actions: https://github.com/$(gh repo view --json owner,name -q '.owner.login + \"/\" + .name')/actions"
echo -e "   Vercel Dashboard: https://vercel.com/dashboard"
echo ""
echo -e "${GREEN}✨ Happy deploying!${NC}"
