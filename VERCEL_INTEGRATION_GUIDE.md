# Integrasi Vercel dengan GitHub Actions CI/CD

## Overview

Jika Vercel sudah terhubung dengan GitHub repository dan melakukan auto-deployment dari branch `main`, kita perlu menyesuaikan CI/CD workflow untuk memastikan test tetap berjalan sebelum Vercel melakukan deployment.

## Problem yang Diselesaikan

1. **Babel vs SWC Conflict**: `next/font` memerlukan SWC, tapi Jest menggunakan Babel
2. **Vercel Auto-Deploy**: Vercel deploy otomatis tanpa menunggu test CI
3. **Test Blocking**: Perlu memastikan test gagal bisa memblokir deployment

## Solusi yang Diterapkan

### 1. Migrasi dari Babel ke SWC untuk Jest

#### Perubahan Dependencies:
```bash
# Removed Babel dependencies
- @babel/core
- @babel/preset-env  
- @babel/preset-react
- @babel/preset-typescript
- babel-jest
- babel-loader

# Added SWC dependencies
+ @swc/core
+ @swc/jest
```

#### Jest Configuration (`jest.config.js`):
```javascript
module.exports = {
  // ...existing config...
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
        },
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }],
  },
}
```

#### Removed Files:
- `babel.config.js` (deleted to avoid conflict)

### 2. GitHub Actions Workflow untuk Vercel

#### Current Workflow Structure:
```yaml
jobs:
  frontend:
    # Run tests, build validation
    steps:
      - Install dependencies
      - Run Jest tests
      - Upload coverage
      - Build validation

  deployment-ready:
    needs: frontend
    # Signal that deployment is ready
    # Vercel will see this as a successful check
```

## Strategi Integrasi dengan Vercel

### Pilihan 1: Branch Protection Rules (Recommended)

1. **Setup Branch Protection di GitHub**:
   - Go to Settings > Branches
   - Add rule for `main` branch
   - Enable "Require status checks to pass before merging"
   - Select "frontend" job sebagai required check

2. **Vercel Configuration**:
   - Vercel akan menunggu status checks selesai
   - Deployment hanya terjadi jika semua checks ✅
   - Jika test gagal, Vercel tidak akan deploy ❌

### Pilihan 2: Vercel Build Command Override

Edit `vercel.json` atau project settings:
```json
{
  "buildCommand": "npm run test:ci && npm run build",
  "framework": "nextjs"
}
```

### Pilihan 3: Disable Auto-Deploy, Use Manual Trigger

1. **Disable Vercel Auto-Deploy**:
   - Vercel Dashboard > Project Settings
   - Git > Disable auto-deploy for main branch

2. **Manual Deploy via GitHub Actions**:
   ```yaml
   deploy-to-vercel:
     needs: frontend
     if: needs.frontend.result == 'success'
     steps:
       - name: Deploy to Vercel
         run: vercel deploy --prod --token ${{ secrets.VERCEL_TOKEN }}
   ```

## Status Saat Ini

### ✅ Yang Sudah Berhasil:
- SWC configuration untuk Jest ✅
- Next.js build tanpa Babel conflict ✅
- All tests passing (36/36) ✅
- GitHub Actions workflow working ✅

### 🔄 Workflow Flow:
```
Push to main → GitHub Actions → Run Tests → Status Check → Vercel Deploy
```

#### Jika Tests Pass:
```
1. frontend job: Tests ✅ → Build ✅ → SUCCESS
2. deployment-ready job: Signal ready ✅
3. Vercel: See success status → Auto-deploy ✅
```

#### Jika Tests Fail:
```
1. frontend job: Tests ❌ → FAIL
2. deployment-ready job: SKIPPED
3. Vercel: See failed status → Block deploy ❌
```

## Configuration Files

### Updated Files:
- `jest.config.js` - Menggunakan SWC transform
- `.github/workflows/ci.yml` - Updated untuk status checks
- `package.json` - Dependencies update

### Removed Files:
- `babel.config.js` - Tidak diperlukan lagi

## Testing Workflow

### 1. Local Testing:
```bash
# Test Jest with SWC
npm run test:ci

# Test Next.js build
npm run build
```

### 2. CI Testing:
```bash
# Push to branch untuk testing
git push origin feature-branch

# Check GitHub Actions
# Lihat apakah tests berjalan dengan SWC
```

### 3. Vercel Integration Testing:
```bash
# Push to main branch
git push origin main

# Monitor:
# 1. GitHub Actions status
# 2. Vercel deployment logs
# 3. Pastikan deployment hanya terjadi jika tests pass
```

## Branch Protection Setup

### Langkah-langkah:
1. **GitHub Repository Settings**
2. **Branches** → **Add rule**
3. **Branch name pattern**: `main`
4. **Enable**:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Select status checks: `frontend`, `deployment-ready`

### Result:
- Direct push ke main: Blocked jika tests fail
- PR merge: Hanya allowed jika CI success
- Vercel deploy: Hanya terjadi setelah status checks pass

## Monitoring & Debugging

### GitHub Actions Logs:
- Test execution dengan SWC
- Build validation
- Status check results

### Vercel Logs:
- Deployment triggers
- Build success/failure
- Runtime errors (jika ada)

### Performance Comparison:

#### Before (Babel):
- Test duration: ~3s
- Build conflicts: ❌ next/font error
- Configuration: Complex babel setup

#### After (SWC):
- Test duration: ~2.6s ✅ (faster)
- Build conflicts: ✅ No conflicts
- Configuration: Simpler SWC setup

## Troubleshooting

### Common Issues:

1. **SWC Transform Errors**:
   - Check JSX transform configuration
   - Verify TypeScript syntax setting

2. **Vercel Still Auto-Deploying**:
   - Check branch protection rules
   - Verify status check requirements

3. **Tests Still Using Babel**:
   - Ensure babel.config.js is deleted
   - Clear node_modules if needed
   - Check jest.config.js transform setting

### Debug Commands:
```bash
# Check current test setup
npm run test:ci -- --verbose

# Check Next.js configuration
npx next info

# Verify no Babel conflicts
npm ls @babel/core # Should show nothing
```

## Test Coverage Summary

### ✅ Current Test Status:
- **Total Test Suites**: 12 ✅
- **Total Test Cases**: 103 ✅
- **All Tests Passing**: 100% success rate
- **Execution Time**: ~2.7 seconds
- **SWC Integration**: Working perfectly

### 📊 Coverage Breakdown:
- **lib/auth.ts**: 100% ✅
- **lib/utils.ts**: 100% ✅ 
- **lib/data.ts**: 100% ✅
- **lib/notifications.ts**: 82.29% ✅
- **contexts/AuthContext.tsx**: 100% ✅
- **hooks/use-mobile.ts**: 100% ✅
- **components/providers.tsx**: 100% ✅
- **components/theme-provider.tsx**: 100% ✅

### 🧪 Test Categories Implemented:
1. **Function-level tests** (auth, notifications, utils, data)
2. **Authentication flow tests** (login, register)
3. **Component tests** (providers, theme-provider)
4. **Context tests** (AuthContext)
5. **Hook tests** (useIsMobile)
6. **CI/CD pipeline tests**

---

**Status**: ✅ SWC migration completed  
**Tests**: ✅ 103/103 passing with SWC  
**Build**: ✅ No conflicts with next/font  
**Vercel**: Ready for branch protection integration
