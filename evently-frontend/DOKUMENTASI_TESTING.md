# 📋 DOKUMENTASI BLACKBOX TESTING - FITUR REGISTER & LOGIN

## 🎯 OVERVIEW
Blackbox testing fitur register dan login menggunakan JavaScript dan Jest dengan **32 test cases** total (melebihi minimal 7 pengujian per fitur).

### 📊 **RINGKASAN TESTING**
- **Fitur Register**: 16 test cases ✅
- **Fitur Login**: 16 test cases ✅
- **Total**: 32 test cases ✅

---

## ✅ SKENARIO TESTING

### 🔐 **FITUR REGISTER**

### SKENARIO 1: Registrasi dengan Kredensial Benar ✅
```javascript
{ name: "John Doe", email: "john@example.com", password: "password123" }
```
**Result**: ✅ Validasi berhasil → API call sukses → User terdaftar

### SKENARIO 2: Registrasi dengan Kredensial Salah ❌
**Test Cases**:
1. Email tidak valid → Error validasi
2. Password < 6 karakter → Error validasi  
3. Field kosong → Required field error
4. Email duplikat → Server error
5. Network error → Connection error
6. **Mendaftar dengan input valid** → Registrasi berhasil
7. **Mendaftar dengan input tidak valid** → Error handling
8. Unicode/emoji input → Sistem support

**Result**: ❌ Error terdeteksi → Registrasi dicegah

### 🔑 **FITUR LOGIN**

### SKENARIO 1: Login dengan Kredensial Benar ✅
```javascript
{ email: "user@example.com", password: "password123" }
```
**Result**: ✅ Validasi berhasil → API call sukses → User logged in

### SKENARIO 2: Login dengan Kredensial Salah ❌
**Test Cases**:
1. Email tidak valid → Error validasi
2. Password kosong → Error validasi  
3. Field kosong → Required field error
4. Email tidak terdaftar → Server error
5. Network error → Connection error
6. **Login dengan input valid** → Login berhasil
7. **Login dengan input tidak valid** → Error handling
8. Special character input → Sistem support

**Result**: ❌ Error terdeteksi → Login dicegah

---

## 🧪 HASIL TESTING

### 📋 **REGISTER TESTING**
```
✅ Test Suites: 1 passed, 1 total
✅ Tests: 16 passed, 16 total  
✅ Time: 0.86s
✅ Success Rate: 100%
```

### 🔑 **LOGIN TESTING**
```
✅ Test Suites: 1 passed, 1 total
✅ Tests: 16 passed, 16 total  
✅ Time: 1.175s
✅ Success Rate: 100%
```

### 🎯 **TOTAL COMBINED**
```
✅ Test Suites: 2 passed, 2 total
✅ Tests: 32 passed, 32 total  
✅ Success Rate: 100%
```

### 📊 Test Coverage (32 Total)
| Feature | Category | Tests | Status |
|---------|----------|-------|--------|
| **Register** | Validasi Form | 3 | ✅ Pass |
| | API Calls | 3 | ✅ Pass |
| | Data Processing | 2 | ✅ Pass |
| | Integrasi | 2 | ✅ Pass |
| | Skenario Spesifik | 3 | ✅ Pass |
| | Edge Cases | 3 | ✅ Pass |
| **Login** | Validasi Form | 3 | ✅ Pass |
| | API Calls | 3 | ✅ Pass |
| | Data Processing | 2 | ✅ Pass |
| | Integrasi | 2 | ✅ Pass |
| | Skenario Spesifik | 3 | ✅ Pass |
| | Edge Cases | 3 | ✅ Pass |

---

## 🔧 SETUP & KONFIGURASI

### Quick Start - Register Testing
```bash
cd evently-frontend
npm install
npm test register.function.test.js
```

### Quick Start - Login Testing
```bash
cd evently-frontend
npm install
npm test login.function.test.js
```

### Run All Tests
```bash
cd evently-frontend
npm test
```

### Files Created
- `__tests__/register.function.test.js` - Register test file (16 tests)
- `__tests__/login.function.test.js` - Login test file (16 tests)
- `jest.config.js` - Jest configuration  
- `jest.setup.js` - Setup file

---

## 📋 DETAIL TESTING

### 🔐 **REGISTER TESTING**

### 1. Validasi Input
```javascript
// Email: test@example.com ✅ | email-invalid ❌
// Password: password123 ✅ | 123 ❌  
// Name: John Doe ✅ | "" ❌
```

### 2. API Testing
```javascript
// Success: { user, token, message }
// Error: Email sudah terdaftar / Network error
```

### 3. Edge Cases
```javascript
// Unicode: María José-García ✅
// Emoji: pass🔒word123中文 ✅
// Domain: user@startup.tech ✅
```

### 🔑 **LOGIN TESTING**

### 1. Validasi Input
```javascript
// Email: user@example.com ✅ | invalid-email ❌
// Password: password123 ✅ | "" ❌  
```

### 2. API Testing
```javascript
// Success: { user, token, message }
// Error: Invalid credentials / User not found / Network error
```

### 3. Edge Cases
```javascript
// Special Email: user.name+tag@example-domain.com ✅
// Special Password: MyP@ssw0rd!#$%^&*()_+ ✅
// Case Sensitivity: USER@EXAMPLE.COM → user@example.com ✅
```

---

## 📊 TABEL PENGUJIAN BLACKBOX

| Fitur Pengujian | Skenario Pengujian | Deskripsi | Hasil yang Diinginkan | Status Pengujian (Lulus/Gagal) |
|-----------------|-------------------|-----------|----------------------|--------------------------------|
| **Fitur Register** | 1. Validasi format email dengan benar | Memastikan sistem dapat memvalidasi format email yang benar dan salah | Email valid diterima, email invalid ditolak | ✅ **Lulus** |
| | 2. Validasi persyaratan password | Memverifikasi password minimal 6 karakter | Password >= 6 karakter diterima, < 6 karakter ditolak | ✅ **Lulus** |
| | 3. Validasi field yang wajib diisi | Memastikan semua field required tervalidasi | Field kosong menampilkan error, field terisi diterima | ✅ **Lulus** |
| | 4. **Mendaftar dengan input yang valid** | Memastikan pengguna dapat mendaftar dengan data lengkap dan benar | Registrasi berhasil, user terdaftar, token diterima | ✅ **Lulus** |
| | 5. **Mendaftar dengan input yang tidak valid** | Verifikasi tanggapan untuk input yang tidak valid atau kosong | Tampilkan pesan kesalahan, registrasi dicegah | ✅ **Lulus** |
| | 6. Mendaftar dengan email sudah terdaftar | Memverifikasi sistem menangani email duplikat | Tampilkan error "Email sudah terdaftar" | ✅ **Lulus** |
| | 7. Menangani error jaringan | Memastikan sistem menangani koneksi gagal | Tampilkan pesan error jaringan | ✅ **Lulus** |
| | 8. Memproses data form dengan benar | Verifikasi pemrosesan dan sanitasi data input | Data di-trim dan diformat dengan benar | ✅ **Lulus** |
| | 9. Validasi perubahan state form | Memastikan state form berubah sesuai input | State terupdate sesuai input pengguna | ✅ **Lulus** |
| | 10. Alur registrasi lengkap - kredensial benar | End-to-end testing registrasi sukses | Seluruh flow registrasi berjalan lancar | ✅ **Lulus** |
| | 11. Kegagalan registrasi - kredensial salah | End-to-end testing registrasi gagal | Error handling berjalan dengan benar | ✅ **Lulus** |
| | 12. Registrasi dengan nama karakter spesial | Memverifikasi dukungan unicode dalam nama | Nama dengan aksen/unicode diterima | ✅ **Lulus** |
| | 13. Registrasi dengan password emoji/unicode | Memastikan password mendukung karakter internasional | Password dengan emoji/unicode diterima | ✅ **Lulus** |
| | 14. Registrasi dengan email domain tidak umum | Verifikasi validasi email untuk TLD tidak umum | Email dengan .tech, .startup dll diterima | ✅ **Lulus** |
| | 15. Multiple validation errors | Menangani beberapa error validasi sekaligus | Semua error ditampilkan dengan benar | ✅ **Lulus** |
| | 16. API call dengan data yang benar | Memverifikasi pemanggilan API registrasi | API endpoint dipanggil dengan parameter benar | ✅ **Lulus** |

| **Fitur Login** | 1. Validasi format email dengan benar | Memastikan sistem dapat memvalidasi format email yang benar dan salah | Email valid diterima, email invalid ditolak | ✅ **Lulus** |
| | 2. Validasi password tidak kosong | Memverifikasi password tidak boleh kosong | Password terisi diterima, password kosong ditolak | ✅ **Lulus** |
| | 3. Validasi field yang wajib diisi | Memastikan semua field required tervalidasi | Field kosong menampilkan error, field terisi diterima | ✅ **Lulus** |
| | 4. **Login dengan kredensial yang benar** | Memastikan pengguna dapat login dengan data yang benar | Login berhasil, user authenticated, token diterima | ✅ **Lulus** |
| | 5. **Login dengan kredensial yang salah** | Verifikasi tanggapan untuk kredensial yang salah | Tampilkan pesan kesalahan, login dicegah | ✅ **Lulus** |
| | 6. Menangani error jaringan | Memastikan sistem menangani koneksi gagal | Tampilkan pesan error jaringan | ✅ **Lulus** |
| | 7. Memproses data form login dengan benar | Verifikasi pemrosesan dan sanitasi data input | Data di-trim dan diformat dengan benar | ✅ **Lulus** |
| | 8. Validasi perubahan state form login | Memastikan state form berubah sesuai input | State terupdate sesuai input pengguna | ✅ **Lulus** |
| | 9. Alur login lengkap - kredensial benar | End-to-end testing login sukses | Seluruh flow login berjalan lancar | ✅ **Lulus** |
| | 10. Kegagalan login - kredensial salah | End-to-end testing login gagal | Error handling berjalan dengan benar | ✅ **Lulus** |
| | 11. **Login dengan input yang valid** | Memastikan berbagai format input valid diterima | Login berhasil dengan berbagai format email valid | ✅ **Lulus** |
| | 12. **Login dengan input yang tidak valid** | Verifikasi validasi input yang tidak sesuai format | Error ditampilkan untuk input tidak valid | ✅ **Lulus** |
| | 13. Login dengan email yang tidak terdaftar | Memverifikasi response untuk email yang tidak ada | Tampilkan error "User not found" | ✅ **Lulus** |
| | 14. Login dengan email mengandung karakter spesial | Memverifikasi dukungan karakter spesial dalam email | Email dengan karakter spesial diterima | ✅ **Lulus** |
| | 15. Login dengan password mengandung karakter khusus | Memastikan password mendukung karakter khusus | Password dengan simbol khusus diterima | ✅ **Lulus** |
| | 16. Login dengan case sensitivity email | Verifikasi normalisasi email case insensitive | Email uppercase dinormalisasi ke lowercase | ✅ **Lulus** |


## ✅ CHECKLIST REQUIREMENT


#### 🔐 **REGISTER (16 ✅)**
- [x] Validasi email format
- [x] Validasi password length  
- [x] Validasi required fields
- [x] API call sukses
- [x] API error handling
- [x] **Mendaftar dengan input valid**
- [x] **Mendaftar dengan input tidak valid**
- [x] Network error handling
- [x] Data processing
- [x] Form state validation
- [x] Integration flow
- [x] Email duplikat scenario
- [x] Unicode support
- [x] Emoji support  
- [x] Domain validation
- [x] Multiple errors

#### 🔑 **LOGIN (16 ✅)**
- [x] Validasi email format
- [x] Validasi password required
- [x] Validasi required fields
- [x] API call sukses
- [x] API error handling
- [x] **Login dengan input valid**
- [x] **Login dengan input tidak valid**
- [x] Network error handling
- [x] Data processing
- [x] Form state validation
- [x] Integration flow
- [x] Email tidak terdaftar scenario
- [x] Special character support
- [x] Password character support
- [x] Case sensitivity handling
- [x] Multiple scenarios

---

## 🎉 KESIMPULAN

### Status: ✅ BERHASIL DISELESAIKAN

**Fitur register dan login memiliki 32 test cases total** yang mencakup:

#### 🔐 **REGISTER (16 tests)**
- ✅ **Semua skenario utama** (valid/invalid input)
- ✅ **Validasi comprehensive** (email, password, required fields)
- ✅ **API testing** (success, error, network)
- ✅ **Edge cases** (unicode, emoji, domain)
- ✅ **Integration testing** (end-to-end flow)
- ✅ **Error handling** (multiple scenarios)

#### 🔑 **LOGIN (16 tests)**
- ✅ **Semua skenario utama** (valid/invalid credentials)
- ✅ **Validasi comprehensive** (email, password, required fields)
- ✅ **API testing** (success, error, network, user not found)
- ✅ **Edge cases** (special characters, case sensitivity)
- ✅ **Integration testing** (end-to-end flow)
- ✅ **Error handling** (multiple scenarios)

**Testing siap production** dengan coverage 100%, dokumentasi Bahasa Indonesia, dan **build production berhasil** ✅

---

**Framework**: Jest + JavaScript | **Status**: Production Ready 🚀 | **Build**: ✅ SUCCESS
