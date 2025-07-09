# 🔐 GitHub Secrets Setup Manual Guide

## 📋 **Secrets yang Harus Ditambahkan**

Copy paste values dari file .env Anda ke GitHub repository secrets:

### 1. VERCEL_TOKEN
```
[Get from https://vercel.com/account/tokens]
```

### 2. VERCEL_PROJECT_ID  
```
prj_pWg5WKt3iEfrwo6M3jCmSq1IZSad
```

### 3. NEXTAUTH_SECRET
```
[Copy from your .env file]
```

### 4. GOOGLE_CLIENT_ID
```
[Copy from your .env file]
```

### 5. GOOGLE_CLIENT_SECRET
```
[Copy from your .env file]
```

### 6. DATABASE_URL
```
[Copy from your .env file]
```

## 🌐 **Cara Manual via Web GitHub**

### Langkah Detail:

1. **Buka Repository**
   - Pergi ke https://github.com/[username]/[repository-name]

2. **Masuk ke Settings**
   - Klik tab "Settings" di bagian atas repository

3. **Pilih Secrets and Variables**
   - Di sidebar kiri, klik "Secrets and variables"
   - Kemudian klik "Actions"

4. **Tambah Secret Baru**
   - Klik tombol "New repository secret"
   - Masukkan nama secret (contoh: VERCEL_TOKEN)
   - Masukkan value secret (copy dari list di atas)
   - Klik "Add secret"

5. **Ulangi untuk Semua Secrets**
   - Lakukan langkah 4 untuk semua 6 secrets di atas

### Screenshot Flow:
```
Repository → Settings → Secrets and variables → Actions → New repository secret
```

## ⚡ **Cara Otomatis via GitHub CLI**

Jika Anda prefer command line:

### Install GitHub CLI:
```bash
# macOS
brew install gh

# atau download dari https://cli.github.com/
```

### Login ke GitHub:
```bash
gh auth login
```

### Jalankan Script Otomatis:
```bash
./setup-github-secrets.sh
```

## 🔍 **Verifikasi Setup**

### Cek via Web:
1. Buka Repository → Settings → Secrets and variables → Actions
2. Anda harus melihat 6 secrets yang sudah ditambahkan

### Cek via CLI:
```bash
gh secret list
```

## 📋 **Checklist**

- [ ] VERCEL_TOKEN
- [ ] VERCEL_PROJECT_ID  
- [ ] NEXTAUTH_SECRET
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] DATABASE_URL

## 🚨 **Troubleshooting**

### Problem: "Repository tidak ditemukan"
**Solusi:** Pastikan repository sudah di-push ke GitHub

### Problem: "Tidak ada akses ke Settings"
**Solusi:** Pastikan Anda owner/admin repository

### Problem: "Secret tidak muncul di list"
**Solusi:** Refresh halaman, secrets kadang butuh waktu untuk muncul

## 🎯 **Setelah Setup Selesai**

1. **Push kode ke repository**
2. **Buat Pull Request** untuk test preview deployment
3. **Merge PR** untuk deploy ke production
4. **Monitor di GitHub Actions** untuk melihat progress deployment

URL GitHub Actions: `https://github.com/[username]/[repository]/actions`
