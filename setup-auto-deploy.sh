#!/bin/bash

# Setup GitHub Secrets untuk Auto Deploy Vercel
# Script ini membaca dari .env file dan setup secrets secara otomatis

set -e

echo "🔐 Setup GitHub Secrets untuk Auto Deploy"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check GitHub CLI
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI tidak ditemukan.${NC}"
    echo -e "${YELLOW}Install dengan: brew install gh${NC}"
    exit 1
fi

# Check if logged in
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}🔑 Login ke GitHub...${NC}"
    gh auth login
fi

# Check .env file
if [ ! -f "evently-frontend/.env" ]; then
    echo -e "${RED}❌ File .env tidak ditemukan di evently-frontend/.env${NC}"
    echo -e "${YELLOW}Buat file .env dengan environment variables yang diperlukan${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Reading environment variables from .env...${NC}"

# Source .env file
cd evently-frontend
set -a
source .env
set +a
cd ..

echo -e "${BLUE}🔑 Setting up GitHub secrets...${NC}"

# Setup Vercel Token
echo -e "${YELLOW}📝 Masukkan Vercel Token (dapatkan dari https://vercel.com/account/tokens):${NC}"
read -s VERCEL_TOKEN

if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${RED}❌ Vercel token required!${NC}"
    exit 1
fi

# Set all secrets
echo -e "${BLUE}⚙️ Setting secrets...${NC}"

gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN"
echo "✅ VERCEL_TOKEN"

gh secret set VERCEL_PROJECT_ID --body "prj_pWg5WKt3iEfrwo6M3jCmSq1IZSad"
echo "✅ VERCEL_PROJECT_ID"

if [ -n "$NEXTAUTH_SECRET" ]; then
    gh secret set NEXTAUTH_SECRET --body "$NEXTAUTH_SECRET"
    echo "✅ NEXTAUTH_SECRET"
else
    echo -e "${RED}❌ NEXTAUTH_SECRET not found in .env${NC}"
fi

if [ -n "$GOOGLE_CLIENT_ID" ]; then
    gh secret set GOOGLE_CLIENT_ID --body "$GOOGLE_CLIENT_ID"
    echo "✅ GOOGLE_CLIENT_ID"
else
    echo -e "${RED}❌ GOOGLE_CLIENT_ID not found in .env${NC}"
fi

if [ -n "$GOOGLE_CLIENT_SECRET" ]; then
    gh secret set GOOGLE_CLIENT_SECRET --body "$GOOGLE_CLIENT_SECRET"
    echo "✅ GOOGLE_CLIENT_SECRET"
else
    echo -e "${RED}❌ GOOGLE_CLIENT_SECRET not found in .env${NC}"
fi

if [ -n "$DATABASE_URL" ]; then
    gh secret set DATABASE_URL --body "$DATABASE_URL"
    echo "✅ DATABASE_URL"
else
    echo -e "${RED}❌ DATABASE_URL not found in .env${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup GitHub Secrets selesai!${NC}"
echo ""
echo -e "${BLUE}📊 Secrets yang telah diatur:${NC}"
gh secret list

echo ""
echo -e "${BLUE}🚀 Langkah selanjutnya untuk mengaktifkan auto deploy:${NC}"
echo -e "   1. Merge branch 'cicd-clean' ke 'main'"
echo -e "   2. Setiap push ke 'main' akan auto deploy ke Vercel"
echo -e "   3. Pull requests akan membuat preview deployment"

echo ""
echo -e "${GREEN}✨ Auto deploy siap digunakan!${NC}"
