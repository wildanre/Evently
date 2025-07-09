# Setup iPaymu Payment Gateway

## 1. Daftar Akun iPaymu

1. Kunjungi [iPaymu.com](https://ipaymu.com/)
2. Daftar akun merchant
3. Verifikasi akun dan lengkapi dokumen bisnis
4. Aktifkan akun merchant

## 2. Dapatkan Kredensial API

### Sandbox (Testing):
1. Login ke dashboard iPaymu
2. Pilih menu "API Settings" atau "Pengaturan API"
3. Catat kredensial berikut:
   - **API Key**: Kunci untuk autentikasi
   - **VA Number**: Virtual Account number
   - **Base URL**: `https://sandbox.ipaymu.com/api/v2`

### Production:
- **Base URL**: `https://my.ipaymu.com/api/v2`

## 3. Konfigurasi Environment Variables

Update file `.env` dengan kredensial iPaymu Anda:

```bash
# iPaymu Configuration
IPAYMU_API_KEY="your-actual-api-key"
IPAYMU_VA="your-va-number"
IPAYMU_BASE_URL="https://sandbox.ipaymu.com/api/v2"  # Sandbox
# IPAYMU_BASE_URL="https://my.ipaymu.com/api/v2"      # Production

# URL Configuration
FRONTEND_URL="http://localhost:3000"                 # Development
BACKEND_URL="http://localhost:3001"                  # Development
# FRONTEND_URL="https://your-frontend.vercel.app"    # Production
# BACKEND_URL="https://your-backend.vercel.app"      # Production
```

## 4. Cara Mendapatkan Kredensial

### Langkah Detail:
1. **Login ke Dashboard iPaymu**
2. **Navigasi ke API Settings**:
   - Cari menu "Developer" atau "API"
   - Klik "API Key" atau "Pengaturan API"
3. **Generate API Key**:
   - Klik "Generate New API Key"
   - Simpan API Key dengan aman
4. **Dapatkan VA Number**:
   - Biasanya tersedia di halaman yang sama
   - Atau di menu "Virtual Account"

## 5. Testing Mode vs Production

### Sandbox (Testing):
```bash
IPAYMU_BASE_URL="https://sandbox.ipaymu.com/api/v2"
```
- Untuk testing dan development
- Tidak ada transaksi real money
- Bisa menggunakan fake payment methods

### Production:
```bash
IPAYMU_BASE_URL="https://my.ipaymu.com/api/v2"
```
- Untuk aplikasi live
- Transaksi menggunakan uang asli
- Perlu verifikasi akun penuh

## 6. Webhook Configuration

Di dashboard iPaymu, set webhook URL:
```
https://your-backend-domain.com/api/payments/webhook
```

## 7. Payment Methods yang Didukung

- **Virtual Account**: Bank Transfer
- **Credit Card**: Visa, MasterCard, JCB
- **QRIS**: E-wallet (GoPay, OVO, DANA, dll)
- **Convenience Store**: Alfamart, Indomaret

## 8. Status Saat Ini

Aplikasi saat ini menggunakan **Mock Payment** untuk demo:
- Tidak perlu kredensial real iPaymu
- Payment akan berhasil secara otomatis
- Untuk testing UI dan flow

## 9. Mengaktifkan Real iPaymu API

Edit file `paymentRoutes.ts`:
1. **Uncomment** bagian real iPaymu API
2. **Comment** bagian mock payment
3. Pastikan environment variables sudah benar

```typescript
// Uncomment this section for real iPaymu API
const response = await axios.post(`${IPAYMU_BASE_URL}${endpoint}`, paymentData, {
  headers: {
    'Content-Type': 'application/json',
    'signature': signature,
    'va': IPAYMU_VA,
    'timestamp': Math.floor(Date.now() / 1000).toString()
  }
});

// Comment this section when using real API
// const mockPaymentUrl = `${process.env.FRONTEND_URL}/payment/mock?paymentId=${payment.id}&amount=${amount}`;
```

## 10. Troubleshooting

### Common Issues:
1. **Invalid Signature**: Pastikan API Key benar
2. **VA Number Error**: Pastikan VA Number sesuai akun
3. **Webhook Not Working**: Pastikan URL webhook accessible dari internet

### Debug Mode:
Enable logging di `paymentRoutes.ts` untuk troubleshooting:
```typescript
console.log('iPaymu Request:', paymentData);
console.log('iPaymu Response:', response.data);
```

## 11. Biaya dan Limit

- **Setup Fee**: Bervariasi tergantung paket
- **Transaction Fee**: 2.9% + Rp 2,500 (standar)
- **Settlement**: T+1 atau T+2
- **Minimum Transaction**: Rp 10,000

## 12. Support

- **Documentation**: [iPaymu Developer Docs](https://ipaymu.com/developer)
- **Support Email**: developer@ipaymu.com
- **WhatsApp**: +62 811-2500-996

---

**Note**: Saat ini aplikasi menggunakan mock payment untuk demo. Untuk production, pastikan mendapatkan kredensial real dari iPaymu dan update environment variables sesuai panduan di atas.
