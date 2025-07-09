# CI/CD Setup Guide untuk Evently Frontend

Panduan ini menjelaskan cara mengatur pipeline CI/CD untuk deployment otomatis frontend Evently ke Vercel menggunakan GitHub Actions.

## 🎯 Fitur CI/CD Pipeline

- ✅ **Automated Testing**: Lint, type check, dan unit tests
- ✅ **Build Validation**: Memastikan aplikasi dapat di-build tanpa error
- ✅ **Preview Deployment**: Deploy otomatis untuk Pull Request
- ✅ **Production Deployment**: Deploy otomatis ke production pada push ke main/master
- ✅ **Environment Variables**: Upload dan manage environment variables secara otomatis
- ✅ **Performance Monitoring**: Lighthouse CI untuk monitoring performa
- ✅ **Error Prevention**: Deployment hanya dilakukan jika semua test berhasil

## 🚀 Setup Instructions

### 1. Setup Vercel Project

```bash
# Install Vercel CLI
npm install -g vercel

# Login ke Vercel
vercel login

# Link project ke Vercel (jalankan di root frontend)
cd evently-frontend
vercel link

# Dapatkan Project ID dan Org ID
vercel project ls
```

### 2. Setup GitHub Secrets

Tambahkan secrets berikut di GitHub repository (Settings > Secrets and variables > Actions):

#### Vercel Secrets:
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

#### Application Environment Variables:
```
NEXT_PUBLIC_API_URL=your_backend_api_url
NEXT_PUBLIC_API_BASE_URL=your_backend_base_url
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=your_production_url
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Optional (untuk Lighthouse CI):
```
LHCI_GITHUB_APP_TOKEN=your_lighthouse_github_token
LHCI_SERVER_TOKEN=your_lighthouse_server_token
```

### 3. Mendapatkan Vercel Token

1. Buka [Vercel Dashboard](https://vercel.com/account/tokens)
2. Klik "Create Token"
3. Beri nama token (misal: "GitHub Actions")
4. Copy token dan simpan sebagai `VERCEL_TOKEN` di GitHub Secrets

### 4. Mendapatkan Vercel Org ID dan Project ID

```bash
# Setelah vercel link, jalankan:
cat .vercel/project.json
```

Atau gunakan script helper yang disediakan:

```bash
chmod +x setup-cicd.sh
./setup-cicd.sh
```

## 📁 File Structure

```
evently-frontend/
├── .github/
│   └── workflows/
│       └── deploy-frontend.yml     # GitHub Actions workflow
├── vercel.json                     # Vercel configuration
├── lighthouserc.json              # Lighthouse CI configuration
├── lighthouse-budget.json         # Performance budgets
└── setup-cicd.sh                  # Helper setup script
```

## 🔄 Workflow Behavior

### Pull Request:
1. Run tests (lint, type check, unit tests)
2. Build application
3. Deploy preview ke Vercel
4. Comment di PR dengan preview URL

### Push ke Main/Master:
1. Run tests (lint, type check, unit tests)
2. Build application  
3. Deploy ke production Vercel
4. Upload environment variables
5. Run Lighthouse performance check

## 🔧 Environment Variables Management

Environment variables dimanage dalam 3 level:

1. **GitHub Secrets**: Untuk build time dan deployment
2. **Vercel Environment**: Diupload otomatis oleh workflow
3. **Local .env**: Untuk development

### Menambah Environment Variable Baru:

1. Tambahkan ke GitHub Secrets
2. Update workflow file untuk include variable baru
3. Update vercel.json jika diperlukan

## 📊 Performance Monitoring

Lighthouse CI akan check:
- **Performance**: Min score 80%
- **Accessibility**: Min score 90% 
- **Best Practices**: Min score 90%
- **SEO**: Min score 90%

Configure budgets di `lighthouse-budget.json`:
- Total bundle size: 500KB
- Script bundle: 150KB
- Images: 100KB
- CSS: 50KB

## 🐛 Troubleshooting

### Common Issues:

1. **Build fails pada GitHub Actions**:
   - Check environment variables sudah ditambahkan
   - Pastikan dependencies di package.json sudah benar
   - Check TypeScript errors

2. **Vercel deployment fails**:
   - Verify VERCEL_TOKEN masih valid
   - Check VERCEL_ORG_ID dan VERCEL_PROJECT_ID benar
   - Pastikan project sudah di-link ke Vercel

3. **Environment variables tidak ter-upload**:
   - Check format secrets di GitHub
   - Verify Vercel token punya permission yang cukup
   - Check vercel.json configuration

### Debug Commands:

```bash
# Test build locally
npm run build

# Test dengan environment variables
NEXT_PUBLIC_API_URL=your_url npm run build

# Check Vercel project info
vercel project ls

# Manual deploy untuk testing
vercel --prod
```

## 🔄 Maintenance

### Regular Tasks:

1. **Update dependencies** bulanan
2. **Review Lighthouse reports** untuk performance regression
3. **Rotate Vercel tokens** setiap 6 bulan
4. **Check environment variables** masih valid

### Monitoring:

- Monitor GitHub Actions untuk failed deployments
- Check Vercel deployment logs
- Review Lighthouse CI reports
- Monitor application errors di production

## 🚀 Next Steps

Setelah setup selesai:

1. Test dengan membuat Pull Request
2. Verify preview deployment bekerja
3. Test production deployment
4. Configure Lighthouse CI server (opsional)
5. Setup monitoring alerts (opsional)

## 📞 Support

Jika ada masalah:
1. Check GitHub Actions logs
2. Check Vercel deployment logs  
3. Review dokumentasi Vercel CLI
4. Check GitHub Secrets configuration
