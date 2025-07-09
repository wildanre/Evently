#!/bin/bash

# Quick GitHub Secrets Setup for Evently Frontend CI/CD
# This script reads from .env file and sets GitHub secrets

set -e

echo "🔐 GitHub Secrets Setup untuk Evently Frontend"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI tidak ditemukan. Install dulu dari https://cli.github.com/${NC}"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree &> /dev/null; then
    echo -e "${RED}❌ Ini bukan repository git. Jalankan dari dalam folder project.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f "evently-frontend/.env" ]; then
    echo -e "${RED}❌ File .env tidak ditemukan di evently-frontend/.env${NC}"
    echo -e "${YELLOW}Buat file .env terlebih dahulu dengan environment variables yang diperlukan${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Mengatur GitHub Secrets dari file .env...${NC}"

# Read environment variables from .env file
source evently-frontend/.env

# Set all required secrets
echo -e "${YELLOW}🔑 Mengatur Vercel Token...${NC}"
echo -e "${YELLOW}Enter your Vercel Token:${NC}"
read -s vercel_token
gh secret set VERCEL_TOKEN --body "$vercel_token"

echo -e "${YELLOW}🔑 Mengatur NextAuth Secret...${NC}"
if [ -n "$NEXTAUTH_SECRET" ]; then
    gh secret set NEXTAUTH_SECRET --body "$NEXTAUTH_SECRET"
else
    echo -e "${RED}❌ NEXTAUTH_SECRET tidak ditemukan di .env${NC}"
    exit 1
fi

echo -e "${YELLOW}🔑 Mengatur Google Client ID...${NC}"
if [ -n "$GOOGLE_CLIENT_ID" ]; then
    gh secret set GOOGLE_CLIENT_ID --body "$GOOGLE_CLIENT_ID"
else
    echo -e "${RED}❌ GOOGLE_CLIENT_ID tidak ditemukan di .env${NC}"
    exit 1
fi

echo -e "${YELLOW}🔑 Mengatur Google Client Secret...${NC}"
if [ -n "$GOOGLE_CLIENT_SECRET" ]; then
    gh secret set GOOGLE_CLIENT_SECRET --body "$GOOGLE_CLIENT_SECRET"
else
    echo -e "${RED}❌ GOOGLE_CLIENT_SECRET tidak ditemukan di .env${NC}"
    exit 1
fi

echo -e "${YELLOW}🔑 Mengatur Database URL...${NC}"
if [ -n "$DATABASE_URL" ]; then
    gh secret set DATABASE_URL --body "$DATABASE_URL"
else
    echo -e "${RED}❌ DATABASE_URL tidak ditemukan di .env${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Semua GitHub Secrets berhasil diatur!${NC}"
echo ""
echo -e "${BLUE}📊 Secrets yang telah diatur:${NC}"
echo -e "   ✅ VERCEL_TOKEN"
echo -e "   ✅ NEXTAUTH_SECRET"
echo -e "   ✅ GOOGLE_CLIENT_ID"
echo -e "   ✅ GOOGLE_CLIENT_SECRET"
echo -e "   ✅ DATABASE_URL"

echo ""
echo -e "${BLUE}🔍 Untuk memverifikasi secrets yang sudah diatur:${NC}"
echo -e "   gh secret list"

echo ""
echo -e "${BLUE}🚀 Langkah selanjutnya:${NC}"
echo -e "   1. Push kode ke repository"
echo -e "   2. Buat Pull Request untuk test preview deployment"
echo -e "   3. Merge PR untuk deploy ke production"

echo ""
echo -e "${GREEN}🎉 Setup CI/CD selesai! Pipeline siap digunakan.${NC}"
