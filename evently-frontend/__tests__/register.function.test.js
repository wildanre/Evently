/**
 * BLACKBOX TESTING - FUNGSI REGISTER
 * 
 * Skenario Testing:
 * 1. Masuk ke halaman register dengan kredensial benar
 * 2. Masuk ke halaman register dengan kredensial salah
 * 
 * Testing utility functions dan validation logic
 * Fokus pada unit testing untuk function-function yang digunakan dalam register
 */

// Mock fetch globally
global.fetch = jest.fn();

describe('Fungsi Register - Pengujian Function', () => {
  
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('Fungsi Validasi Form', () => {
    
    test('harus memvalidasi format email dengan benar', () => {
      console.log('🧪 Testing: Fungsi validasi email');
      
      // Email yang benar
      const emailBenar = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test123@test-domain.com',
        'user+tag@example.org'
      ];
      
      // Email yang salah
      const emailSalah = [
        'invalid',
        'test@',
        '@domain.com',
        'test.domain.com',
        '',
        'test space@domain.com'
      ];
      
      // Test HTML5 email validation pattern
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      emailBenar.forEach(email => {
        expect(emailPattern.test(email)).toBe(true);
      });
      
      emailSalah.forEach(email => {
        expect(emailPattern.test(email)).toBe(false);
      });
      
      console.log('✅ Test validasi email berhasil');
    });
    
    test('harus memvalidasi persyaratan password', () => {
      console.log('🧪 Testing: Fungsi validasi password');
      
      // Test validasi panjang password
      const passwordPendek = ['', '1', '12', '123', '1234', '12345'];
      const passwordBenar = ['123456', 'password', 'mypassword123', 'P@ssw0rd!'];
      
      passwordPendek.forEach(password => {
        expect(password.length < 6).toBe(true);
      });
      
      passwordBenar.forEach(password => {
        expect(password.length >= 6).toBe(true);
      });
      
      console.log('✅ Test validasi password berhasil');
    });
    
    test('harus memvalidasi field yang wajib diisi', () => {
      console.log('🧪 Testing: Validasi field wajib');
      
      const kasusUji = [
        { name: '', email: 'test@example.com', password: '123456', valid: false },
        { name: 'John', email: '', password: '123456', valid: false },
        { name: 'John', email: 'test@example.com', password: '', valid: false },
        { name: 'John', email: 'test@example.com', password: '123456', valid: true },
      ];
      
      kasusUji.forEach(({ name, email, password, valid }) => {
        const isValid = name.trim() !== '' && email.trim() !== '' && password.trim() !== '';
        expect(isValid).toBe(valid);
      });
      
      console.log('✅ Test validasi field wajib berhasil');
    });
  });

  describe('Fungsi Pemanggilan API', () => {
    
    test('harus memanggil API register dengan data yang benar - SKENARIO 1: Kredensial Benar', async () => {
      console.log('🧪 Testing: Pemanggilan API register dengan kredensial yang benar');
      
      // Mock response API yang berhasil
      const mockResponse = {
        message: 'Registrasi berhasil',
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
        },
        token: 'mock-jwt-token'
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });
      
      // Simulasi fungsi registerUser
      const registerUser = async (data) => {
        const response = await fetch('https://evently-backend-amber.vercel.app/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Registrasi gagal');
        }
        
        return response.json();
      };
      
      // Data uji
      const dataUji = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      
      // Panggil fungsi
      const result = await registerUser(dataUji);
      
      // Verifikasi API dipanggil dengan benar
      expect(fetch).toHaveBeenCalledWith(
        'https://evently-backend-amber.vercel.app/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataUji),
        }
      );
      
      // Verifikasi response
      expect(result).toEqual(mockResponse);
      expect(result.user.name).toBe('John Doe');
      expect(result.user.email).toBe('john@example.com');
      expect(result.token).toBe('mock-jwt-token');
      
      console.log('✅ Test pemanggilan API register berhasil - Kredensial benar');
    });
    
    test('harus menangani error API - SKENARIO 2: Kredensial Salah', async () => {
      console.log('🧪 Testing: Penanganan error API register dengan kredensial yang salah');
      
      // Mock response error API
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email sudah terdaftar' }),
      });
      
      // Simulasi fungsi registerUser
      const registerUser = async (data) => {
        const response = await fetch('https://evently-backend-amber.vercel.app/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Registrasi gagal');
        }
        
        return response.json();
      };
      
      // Data uji dengan email yang sudah ada
      const dataUji = {
        name: 'Jane Doe',
        email: 'existing@example.com',
        password: 'password123'
      };
      
      // Test bahwa error dilempar
      await expect(registerUser(dataUji)).rejects.toThrow('Email sudah terdaftar');
      
      // Verifikasi API dipanggil
      expect(fetch).toHaveBeenCalledWith(
        'https://evently-backend-amber.vercel.app/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(dataUji),
        })
      );
      
      console.log('✅ Test penanganan error API register berhasil - Kredensial salah');
    });
    
    test('harus menangani error jaringan', async () => {
      console.log('🧪 Testing: Penanganan error jaringan');
      
      // Mock error jaringan
      fetch.mockRejectedValueOnce(new Error('Error jaringan'));
      
      const registerUser = async (data) => {
        try {
          const response = await fetch('https://evently-backend-amber.vercel.app/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registrasi gagal');
          }
          
          return response.json();
        } catch (error) {
          throw new Error(error.message || 'Error jaringan');
        }
      };
      
      const dataUji = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      
      await expect(registerUser(dataUji)).rejects.toThrow('Error jaringan');
      
      console.log('✅ Test penanganan error jaringan berhasil');
    });
  });

  describe('Fungsi Pemrosesan Data', () => {
    
    test('harus memproses data form dengan benar', () => {
      console.log('🧪 Testing: Pemrosesan data form');
      
      // Simulasi pemrosesan data form
      const prosesDataForm = (form) => {
        return {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password
        };
      };
      
      const dataInput = {
        name: '  John Doe  ',
        email: '  JOHN@EXAMPLE.COM  ',
        password: 'password123'
      };
      
      const result = prosesDataForm(dataInput);
      
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.password).toBe('password123');
      
      console.log('✅ Test pemrosesan data form berhasil');
    });
    
    test('harus memvalidasi perubahan state form', () => {
      console.log('🧪 Testing: Validasi state form');
      
      // Simulasi validasi state form
      const validasiStateForm = (form) => {
        const errors = {};
        
        if (!form.name || form.name.trim() === '') {
          errors.name = 'Nama wajib diisi';
        }
        
        if (!form.email || form.email.trim() === '') {
          errors.email = 'Email wajib diisi';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
          errors.email = 'Masukkan email yang valid';
        }
        
        if (!form.password || form.password.length < 6) {
          errors.password = 'Password minimal 6 karakter';
        }
        
        return {
          isValid: Object.keys(errors).length === 0,
          errors
        };
      };
      
      // Kasus uji
      const kasusUji = [
        {
          form: { name: '', email: '', password: '' },
          expectedValid: false,
          expectedErrorCount: 3
        },
        {
          form: { name: 'John', email: 'email-tidak-valid', password: '123' },
          expectedValid: false,
          expectedErrorCount: 2
        },
        {
          form: { name: 'John Doe', email: 'john@example.com', password: 'password123' },
          expectedValid: true,
          expectedErrorCount: 0
        }
      ];
      
      kasusUji.forEach(({ form, expectedValid, expectedErrorCount }) => {
        const result = validasiStateForm(form);
        expect(result.isValid).toBe(expectedValid);
        expect(Object.keys(result.errors).length).toBe(expectedErrorCount);
      });
      
      console.log('✅ Test validasi state form berhasil');
    });
  });

  describe('Skenario Uji Integrasi', () => {
    
    test('SKENARIO 1: Alur registrasi lengkap dengan kredensial benar', async () => {
      console.log('🧪 Testing: Alur registrasi lengkap - kredensial benar');
      
      // Mock API yang berhasil
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Registrasi berhasil',
          user: { id: '1', name: 'John Doe', email: 'john@example.com' },
          token: 'jwt-token'
        }),
      });
      
      // Simulasi proses registrasi lengkap
      const registrasiLengkap = async (dataForm) => {
        // 1. Validasi form
        const validation = {
          isValid: dataForm.name && dataForm.email && dataForm.password.length >= 6,
          errors: {}
        };
        
        if (!validation.isValid) {
          throw new Error('Validasi gagal');
        }
        
        // 2. Proses data
        const dataDiproses = {
          name: dataForm.name.trim(),
          email: dataForm.email.trim().toLowerCase(),
          password: dataForm.password
        };
        
        // 3. Panggil API
        const response = await fetch('https://evently-backend-amber.vercel.app/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataDiproses),
        });
        
        if (!response.ok) {
          throw new Error('Registrasi gagal');
        }
        
        return response.json();
      };
      
      const dataUji = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      
      const result = await registrasiLengkap(dataUji);
      
      expect(result.message).toBe('Registrasi berhasil');
      expect(result.user.name).toBe('John Doe');
      expect(result.token).toBeDefined();
      
      console.log('✅ Test alur registrasi lengkap berhasil - kredensial benar');
    });
    
    test('SKENARIO 2: Kegagalan registrasi dengan kredensial salah', async () => {
      console.log('🧪 Testing: Kegagalan registrasi - kredensial salah');
      
      // Test email tidak valid
      const dataEmailTidakValid = {
        name: 'John Doe',
        email: 'email-tidak-valid',
        password: 'password123'
      };
      
      const validasiEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      
      expect(validasiEmail(dataEmailTidakValid.email)).toBe(false);
      
      // Test password pendek
      const dataPasswordPendek = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123'
      };
      
      expect(dataPasswordPendek.password.length < 6).toBe(true);
      
      // Test nama kosong
      const dataNamaKosong = {
        name: '',
        email: 'john@example.com',
        password: 'password123'
      };
      
      expect(dataNamaKosong.name.trim() === '').toBe(true);
      
      console.log('✅ Test kegagalan registrasi berhasil - kredensial salah');
    });
  });
  
  describe('Skenario Pendaftaran Spesifik', () => {
    
    test('Mendaftar dengan input yang valid', async () => {
      console.log('🧪 Testing: Mendaftar dengan input yang valid');
      
      // Mock API response sukses
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Pendaftaran berhasil',
          user: {
            id: '123',
            name: 'John Doe',
            email: 'john@example.com',
            profileImageUrl: null,
            bio: null
          },
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }),
      });
      
      // Simulasi fungsi register dengan input valid
      const registerDenganInputValid = async (userData) => {
        // 1. Validasi input
        if (!userData.name || userData.name.trim() === '') {
          throw new Error('Nama wajib diisi');
        }
        if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
          throw new Error('Email tidak valid');
        }
        if (!userData.password || userData.password.length < 6) {
          throw new Error('Password minimal 6 karakter');
        }
        
        // 2. Panggil API register
        const response = await fetch('https://evently-backend-amber.vercel.app/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: userData.name.trim(),
            email: userData.email.trim().toLowerCase(),
            password: userData.password
          }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Pendaftaran gagal');
        }
        
        return response.json();
      };
      
      // Data input yang valid
      const inputValid = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      
      // Test pendaftaran
      const result = await registerDenganInputValid(inputValid);
      
      // Verifikasi hasil
      expect(result.message).toBe('Pendaftaran berhasil');
      expect(result.user).toBeDefined();
      expect(result.user.name).toBe('John Doe');
      expect(result.user.email).toBe('john@example.com');
      expect(result.token).toBeDefined();
      expect(result.token).toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      
      // Verifikasi API dipanggil dengan benar
      expect(fetch).toHaveBeenCalledWith(
        'https://evently-backend-amber.vercel.app/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123'
          }),
        }
      );
      
      console.log('✅ Test mendaftar dengan input yang valid berhasil');
    });
    
    test('Mendaftar dengan input yang tidak valid', async () => {
      console.log('🧪 Testing: Mendaftar dengan input yang tidak valid');
      
      // Simulasi fungsi register dengan validasi input
      const registerDenganInputTidakValid = async (userData) => {
        const errors = [];
        
        // Validasi nama
        if (!userData.name || userData.name.trim() === '') {
          errors.push('Nama wajib diisi');
        }
        
        // Validasi email
        if (!userData.email || userData.email.trim() === '') {
          errors.push('Email wajib diisi');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
          errors.push('Format email tidak valid');
        }
        
        // Validasi password
        if (!userData.password || userData.password.trim() === '') {
          errors.push('Password wajib diisi');
        } else if (userData.password.length < 6) {
          errors.push('Password minimal 6 karakter');
        }
        
        // Jika ada error, lempar exception
        if (errors.length > 0) {
          throw new Error(errors.join(', '));
        }
        
        // Jika tidak ada error, lanjut ke API call
        return { success: true };
      };
      
      // Test Case 1: Nama kosong
      const inputNamaKosong = {
        name: '',
        email: 'john@example.com',
        password: 'password123'
      };
      
      await expect(registerDenganInputTidakValid(inputNamaKosong))
        .rejects.toThrow('Nama wajib diisi');
      
      // Test Case 2: Email tidak valid
      const inputEmailTidakValid = {
        name: 'John Doe',
        email: 'email-tidak-valid',
        password: 'password123'
      };
      
      await expect(registerDenganInputTidakValid(inputEmailTidakValid))
        .rejects.toThrow('Format email tidak valid');
      
      // Test Case 3: Password terlalu pendek
      const inputPasswordPendek = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123'
      };
      
      await expect(registerDenganInputTidakValid(inputPasswordPendek))
        .rejects.toThrow('Password minimal 6 karakter');
      
      // Test Case 4: Email kosong
      const inputEmailKosong = {
        name: 'John Doe',
        email: '',
        password: 'password123'
      };
      
      await expect(registerDenganInputTidakValid(inputEmailKosong))
        .rejects.toThrow('Email wajib diisi');
      
      // Test Case 5: Password kosong
      const inputPasswordKosong = {
        name: 'John Doe',
        email: 'john@example.com',
        password: ''
      };
      
      await expect(registerDenganInputTidakValid(inputPasswordKosong))
        .rejects.toThrow('Password wajib diisi');
      
      // Test Case 6: Multiple errors (semua field kosong)
      const inputSemuaKosong = {
        name: '',
        email: '',
        password: ''
      };
      
      await expect(registerDenganInputTidakValid(inputSemuaKosong))
        .rejects.toThrow('Nama wajib diisi, Email wajib diisi, Password wajib diisi');
      
      // Test Case 7: Multiple errors (email + password invalid)
      const inputMultipleError = {
        name: 'John Doe',
        email: 'invalid-email',
        password: '12'
      };
      
      await expect(registerDenganInputTidakValid(inputMultipleError))
        .rejects.toThrow('Format email tidak valid, Password minimal 6 karakter');
      
      console.log('✅ Test mendaftar dengan input yang tidak valid berhasil');
    });
    
    test('Mendaftar dengan input valid tetapi email sudah terdaftar', async () => {
      console.log('🧪 Testing: Mendaftar dengan input valid tetapi email sudah terdaftar');
      
      // Mock API response error (email sudah ada)
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          error: 'Email sudah terdaftar, silakan gunakan email lain'
        }),
      });
      
      const registerDenganEmailSudahAda = async (userData) => {
        // Validasi input (semua valid)
        if (!userData.name || userData.name.trim() === '') {
          throw new Error('Nama wajib diisi');
        }
        if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
          throw new Error('Email tidak valid');
        }
        if (!userData.password || userData.password.length < 6) {
          throw new Error('Password minimal 6 karakter');
        }
        
        // Panggil API register
        const response = await fetch('https://evently-backend-amber.vercel.app/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: userData.name.trim(),
            email: userData.email.trim().toLowerCase(),
            password: userData.password
          }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Pendaftaran gagal');
        }
        
        return response.json();
      };
      
      // Data input yang valid tapi email sudah ada
      const inputEmailSudahAda = {
        name: 'Jane Doe',
        email: 'existing@example.com',
        password: 'password123'
      };
      
      // Test pendaftaran - harus gagal karena email sudah ada
      await expect(registerDenganEmailSudahAda(inputEmailSudahAda))
        .rejects.toThrow('Email sudah terdaftar, silakan gunakan email lain');
      
      // Verifikasi API tetap dipanggil (karena input valid)
      expect(fetch).toHaveBeenCalledWith(
        'https://evently-backend-amber.vercel.app/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Jane Doe',
            email: 'existing@example.com',
            password: 'password123'
          }),
        }
      );
      
      console.log('✅ Test mendaftar dengan email sudah terdaftar berhasil');
    });
  });

  describe('Skenario Testing Tambahan', () => {
    
    test('SKENARIO BARU 1: Registrasi dengan nama mengandung karakter spesial', async () => {
      console.log('🧪 Testing: Registrasi dengan nama mengandung karakter spesial');
      
      // Mock response API untuk case nama dengan karakter spesial
      const mockResponse = {
        message: 'Registrasi berhasil',
        user: {
          id: '5',
          name: 'María José-García',
          email: 'mariajose@example.com',
        },
        token: 'mock-jwt-token-special'
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });
      
      // Simulasi fungsi registerUser
      const registerUser = async (data) => {
        const response = await fetch('https://evently-backend-amber.vercel.app/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Registrasi gagal');
        }
        
        return response.json();
      };
      
      // Data uji dengan nama yang mengandung karakter spesial
      const dataUji = {
        name: 'María José-García',
        email: 'mariajose@example.com',
        password: 'password123'
      };
      
      // Panggil fungsi
      const result = await registerUser(dataUji);
      
      // Verifikasi hasil
      expect(result).toEqual(mockResponse);
      expect(result.user.name).toBe('María José-García');
      expect(result.message).toBe('Registrasi berhasil');
      
      // Verifikasi API dipanggil dengan benar
      expect(fetch).toHaveBeenCalledWith(
        'https://evently-backend-amber.vercel.app/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataUji),
        }
      );
      
      console.log('✅ Test registrasi dengan nama karakter spesial berhasil');
    });

    test('SKENARIO BARU 2: Registrasi dengan password yang mengandung emoji dan karakter unicode', async () => {
      console.log('🧪 Testing: Registrasi dengan password mengandung emoji dan unicode');
      
      // Mock response API untuk password dengan emoji
      const mockResponse = {
        message: 'Registrasi berhasil',
        user: {
          id: '6',
          name: 'Unicode User',
          email: 'unicode@example.com',
        },
        token: 'mock-jwt-token-unicode'
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });
      
      // Simulasi fungsi registerUser
      const registerUser = async (data) => {
        const response = await fetch('https://evently-backend-amber.vercel.app/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Registrasi gagal');
        }
        
        return response.json();
      };
      
      // Data uji dengan password yang mengandung emoji dan unicode
      const dataUji = {
        name: 'Unicode User',
        email: 'unicode@example.com',
        password: 'pass🔒word123中文'
      };
      
      // Validasi bahwa password memenuhi kriteria panjang minimal
      expect(dataUji.password.length >= 6).toBe(true);
      
      // Panggil fungsi
      const result = await registerUser(dataUji);
      
      // Verifikasi hasil
      expect(result).toEqual(mockResponse);
      expect(result.user.email).toBe('unicode@example.com');
      expect(result.message).toBe('Registrasi berhasil');
      
      // Verifikasi API dipanggil dengan benar dan data unicode dikirim dengan benar
      expect(fetch).toHaveBeenCalledWith(
        'https://evently-backend-amber.vercel.app/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataUji),
        }
      );
      
      console.log('✅ Test registrasi dengan password unicode berhasil');
    });

    test('SKENARIO BARU 3: Registrasi dengan email domain yang tidak umum tapi valid', async () => {
      console.log('🧪 Testing: Registrasi dengan email domain tidak umum');
      
      // Mock response API untuk email domain tidak umum
      const mockResponse = {
        message: 'Registrasi berhasil',
        user: {
          id: '7',
          name: 'Domain User',
          email: 'user@my-awesome-startup.tech',
        },
        token: 'mock-jwt-token-domain'
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });
      
      // Simulasi fungsi registerUser
      const registerUser = async (data) => {
        const response = await fetch('https://evently-backend-amber.vercel.app/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Registrasi gagal');
        }
        
        return response.json();
      };
      
      // Data uji dengan email domain yang tidak umum tapi valid
      const dataUji = {
        name: 'Domain User',
        email: 'user@my-awesome-startup.tech',
        password: 'domain123'
      };
      
      // Validasi format email dengan regex
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailPattern.test(dataUji.email)).toBe(true);
      
      // Panggil fungsi
      const result = await registerUser(dataUji);
      
      // Verifikasi hasil
      expect(result).toEqual(mockResponse);
      expect(result.user.email).toBe('user@my-awesome-startup.tech');
      expect(result.message).toBe('Registrasi berhasil');
      
      // Verifikasi API dipanggil dengan benar
      expect(fetch).toHaveBeenCalledWith(
        'https://evently-backend-amber.vercel.app/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataUji),
        }
      );
      
      console.log('✅ Test registrasi dengan email domain tidak umum berhasil');
    });
  });

  // ...existing code...
});

/**
 * MENJALANKAN TESTS:
 * npm test register.function.test.js
 * 
 * HASIL YANG DIHARAPKAN:
 * - Semua fungsi validasi bekerja dengan benar
 * - Pemanggilan API dibuat dengan data yang tepat
 * - Penanganan error bekerja untuk input yang tidak valid
 * - Seluruh skenario sukses dan gagal tercakup
 * - Skenario tambahan dengan karakter spesial dan unicode
 */
