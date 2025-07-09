# GitHub Actions Troubleshooting Guide

## Error: "Resource not accessible by integration"

### Penyebab Masalah:
1. **Permissions tidak tepat** - GitHub Actions tidak memiliki permission yang cukup
2. **Token expired atau invalid** - GITHUB_TOKEN atau secrets lain tidak valid
3. **Branch protection rules** - Repository memiliki aturan yang membatasi akses
4. **API rate limiting** - Terlalu banyak request ke GitHub API

### Solusi yang Sudah Diterapkan:

#### 1. Perbaikan Permissions
```yaml
permissions:
  contents: read
  pull-requests: write
  issues: write
  actions: read
  checks: read
  deployments: write
  statuses: write
```

#### 2. Update GitHub Script Action
- Menggunakan `actions/github-script@v7` (versi terbaru)
- Menambahkan error handling yang lebih baik
- Logging untuk debugging

#### 3. Fallback Strategy
- Deployment tidak akan gagal jika comment gagal dibuat
- Menambahkan debug output untuk troubleshooting
- Success/failure notifications

### Langkah Verifikasi:

1. **Cek Repository Settings:**
   - Pergi ke Settings > Actions > General
   - Pastikan "Workflow permissions" diset ke "Read and write permissions"
   - Atau minimal "Read repository contents and packages permissions" dengan "Allow GitHub Actions to create and approve pull requests" dicentang

2. **Verifikasi Secrets:**
   ```
   - VERCEL_TOKEN
   - GITHUB_TOKEN (otomatis tersedia)
   - NEXTAUTH_SECRET
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - DATABASE_URL
   ```

3. **Branch Protection:**
   - Jika branch `main` atau `master` memiliki protection rules
   - Pastikan GitHub Actions diizinkan untuk bypass restrictions

### Monitoring Deployment:

Sekarang workflow akan memberikan output yang lebih jelas:

```
✅ Deployment berhasil!
Production URL: https://evently-frontend-wildanus-projects-c54861c9.vercel.app
Preview URL: [URL preview jika ada]
```

### Troubleshooting Tambahan:

#### Jika masih ada error:

1. **Re-run workflow** - Kadang error bersifat sementara
2. **Cek Vercel dashboard** - Pastikan deployment benar-benar berhasil
3. **Review logs** - Periksa detail error di GitHub Actions logs
4. **Manual deployment** - Gunakan Vercel CLI sebagai backup

#### Alternative deployment command:
```bash
cd evently-frontend
npx vercel --prod --confirm
```

### Status Saat Ini:
- ✅ Workflow permissions diperbaiki
- ✅ Error handling ditingkatkan
- ✅ Debug logging ditambahkan
- ✅ Fallback strategy diimplementasi
- ✅ Responsivitas komponen diperbaiki

Deployment seharusnya berhasil sekarang meskipun mungkin ada warning tentang comment yang gagal dibuat.
