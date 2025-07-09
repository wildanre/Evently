# CI/CD Setup Guide untuk Deploy ke Vercel

## Overview
Panduan ini menjelaskan cara setup CI/CD pipeline untuk otomatis deploy frontend Evently ke Vercel menggunakan GitHub Actions.

## Prerequisites

### 1. Akun dan Setup Vercel
1. **Buat akun Vercel**: https://vercel.com
2. **Connect GitHub repository** ke Vercel
3. **Import project** `evently-frontend` ke Vercel

### 2. Dapatkan Vercel Credentials
```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Link project
cd evently-frontend
vercel link

# Dapatkan project info
vercel env ls
```

### 3. Required Secrets di GitHub
Buka repository di GitHub → Settings → Secrets and variables → Actions

**Vercel Secrets:**
- `VERCEL_TOKEN`: Personal Access Token dari Vercel
- `VERCEL_ORG_ID`: Organization ID dari `.vercel/project.json`
- `VERCEL_PROJECT_ID`: Project ID dari `.vercel/project.json`

**Environment Variables:**
- `NEXT_PUBLIC_API_URL`: URL backend API
- `NEXT_PUBLIC_API_BASE_URL`: Base URL backend
- `NEXTAUTH_SECRET`: Secret untuk NextAuth
- `NEXTAUTH_URL`: URL frontend untuk NextAuth
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret

## Pipeline Workflow

### 1. **Test Stage** 
```yaml
jobs:
  test:
    - Lint checking (ESLint)
    - Type checking (TypeScript)
    - Unit tests (Jest)
    - Build verification
    - Coverage reporting
```

### 2. **Deploy Preview** (untuk Pull Requests)
```yaml
deploy-preview:
    - Deploy ke Vercel preview environment
    - Comment preview URL di PR
    - Environment: preview
```

### 3. **Deploy Production** (untuk main/master branch)
```yaml
deploy-production:
    - Deploy ke Vercel production
    - Update deployment status
    - Environment: production
```

### 4. **Performance Check** (Lighthouse)
```yaml
lighthouse:
    - Performance audit
    - Accessibility check
    - Best practices verification
    - SEO audit
```

## Setup Instructions

### Step 1: Buat Vercel Project
```bash
# Di directory evently-frontend
vercel

# Follow prompts:
# ? Set up and deploy "~/evently-frontend"? Y
# ? Which scope do you want to deploy to? [Your Team]
# ? Link to existing project? N
# ? What's your project's name? evently-frontend
# ? In which directory is your code located? ./
```

### Step 2: Dapatkan Project Info
```bash
# Setelah vercel setup selesai
cat .vercel/project.json

# Output akan seperti:
# {
#   "orgId": "team_xxx",
#   "projectId": "prj_xxx"
# }
```

### Step 3: Buat Vercel Token
1. Buka https://vercel.com/account/tokens
2. Create new token dengan nama "GitHub Actions"
3. Copy token dan simpan sebagai `VERCEL_TOKEN` di GitHub Secrets

### Step 4: Setup Environment di Vercel
```bash
# Production environment
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_API_BASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production

# Preview environment
vercel env add NEXT_PUBLIC_API_URL preview
vercel env add NEXT_PUBLIC_API_BASE_URL preview
# ... dst untuk semua env vars
```

### Step 5: Update Package.json Scripts
Scripts yang diperlukan sudah ada di `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:ci": "jest --watchAll=false --coverage --ci",
    "lint": "next lint",
    "build": "next build"
  }
}
```

## File Konfigurasi

### 1. `.github/workflows/deploy-frontend.yml`
- **Pipeline utama** untuk CI/CD
- **Trigger**: Push ke main/master atau PR
- **Path filter**: Hanya trigger jika ada perubahan di `evently-frontend/`

### 2. `evently-frontend/vercel.json`
- **Konfigurasi deployment** Vercel
- **Environment variables** mapping
- **Build settings**

### 3. `evently-frontend/lighthouse-budget.json`
- **Performance budgets**
- **Resource limits**
- **Timing thresholds**

## Workflow Triggers

### Automatic Deployment
```yaml
# Deploy to production
on:
  push:
    branches: [main, master]
    paths: ['evently-frontend/**']

# Deploy preview
on:
  pull_request:
    branches: [main, master]
    paths: ['evently-frontend/**']
```

### Manual Deployment
```bash
# Trigger manual deployment
gh workflow run "Deploy Frontend to Vercel"
```

## Environment Variables Management

### Development (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Production (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
NEXT_PUBLIC_API_BASE_URL=https://your-backend.vercel.app
NEXTAUTH_URL=https://your-frontend.vercel.app
NEXTAUTH_SECRET=production-secret
GOOGLE_CLIENT_ID=production-google-client-id
GOOGLE_CLIENT_SECRET=production-google-client-secret
```

## Testing Requirements

Pipeline akan **GAGAL** jika:
- ❌ ESLint errors
- ❌ TypeScript compilation errors  
- ❌ Jest unit tests fail
- ❌ Build process fails
- ❌ Coverage below threshold (70%)

Pipeline akan **BERHASIL** jika:
- ✅ All tests pass
- ✅ No lint errors
- ✅ No type errors
- ✅ Build successful
- ✅ Coverage ≥ 70%

## Monitoring dan Debugging

### 1. GitHub Actions Logs
- Buka repository → Actions tab
- Click pada workflow run untuk melihat logs
- Check setiap job untuk detail errors

### 2. Vercel Dashboard
- Login ke https://vercel.com/dashboard
- Monitor deployments, performance, dan errors
- Check function logs dan build logs

### 3. Performance Monitoring
- Lighthouse reports tersedia di GitHub Actions artifacts
- Performance budgets akan fail jika thresholds terlampaui
- Real User Monitoring (RUM) data di Vercel Analytics

## Troubleshooting

### Common Issues

#### 1. Vercel Authentication Error
```bash
Error: No authorization found for scope
```
**Solution**: Check `VERCEL_TOKEN` di GitHub Secrets

#### 2. Build Failure
```bash
Error: Build failed with exit code 1
```
**Solution**: 
- Check build logs di GitHub Actions
- Verify environment variables
- Test build locally: `npm run build`

#### 3. Test Failures
```bash
Error: Tests failed
```
**Solution**:
- Run tests locally: `npm test`
- Check coverage: `npm run test:coverage`
- Fix failing tests before merge

#### 4. Environment Variables Missing
```bash
Error: Required environment variable not found
```
**Solution**:
- Check Vercel environment settings
- Verify GitHub Secrets
- Update `vercel.json` mapping

## Best Practices

### 1. **Branch Protection**
- Require PR reviews
- Require status checks to pass
- Require branches to be up to date

### 2. **Testing Strategy**
- Write unit tests untuk components
- Add integration tests untuk critical paths
- Use E2E tests untuk user journeys

### 3. **Performance**
- Monitor Core Web Vitals
- Set realistic performance budgets
- Optimize images dan assets

### 4. **Security**
- Never commit secrets ke repository
- Use environment variables untuk sensitive data
- Regularly update dependencies

## Monitoring Dashboard URLs

Setelah setup selesai, bookmark URLs berikut:

- **Production Site**: https://evently-frontend.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Actions**: https://github.com/[username]/Evently/actions
- **Lighthouse Reports**: Available in GitHub Actions artifacts

## Next Steps

1. ✅ **Setup secrets** di GitHub repository
2. ✅ **Configure Vercel** project dan environment variables  
3. ✅ **Test pipeline** dengan membuat dummy PR
4. ✅ **Monitor deployments** dan setup alerts
5. ✅ **Add performance budgets** sesuai kebutuhan
6. ✅ **Setup branch protection** rules
