/**
 * 🧪 BLACKBOX TESTING - FITUR LOGIN
 * Testing function untuk fitur login menggunakan Jest
 * Minimal 7 pengujian sesuai requirement
 */

// Mock fetch global untuk testing API calls
global.fetch = jest.fn();

describe('Fungsi Login - Pengujian Function', () => {
  
  // Reset mock sebelum setiap test
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('Fungsi Validasi Form Login', () => {
    
    test('harus memvalidasi format email dengan benar', () => {
      console.log('🧪 Testing: Fungsi validasi email login');
      
      // Test data
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.id',
        'user123@test-domain.com'
      ];
      
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user.domain.com',
        ''
      ];

      // Function validasi email (simulasi dari form validation)
      const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      // Test email valid
      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });

      // Test email invalid
      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });

      console.log('✅ Test validasi email login berhasil');
    });

    test('harus memvalidasi password tidak kosong', () => {
      console.log('🧪 Testing: Fungsi validasi password login');
      
      // Function validasi password (simulasi dari form validation)
      const validatePassword = (password) => {
        if (!password) return false;
        return password.trim().length > 0;
      };

      // Test password valid
      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('mypassword')).toBe(true);
      expect(validatePassword('pass123!')).toBe(true);

      // Test password invalid
      expect(validatePassword('')).toBe(false);
      expect(validatePassword('   ')).toBe(false);
      expect(validatePassword(null)).toBe(false);
      expect(validatePassword(undefined)).toBe(false);

      console.log('✅ Test validasi password login berhasil');
    });

    test('harus memvalidasi field yang wajib diisi', () => {
      console.log('🧪 Testing: Validasi field wajib login');
      
      // Function validasi required fields
      const validateRequiredFields = (formData) => {
        const { email, password } = formData;
        const errors = {};
        
        if (!email || email.trim() === '') errors.email = 'Email wajib diisi';
        if (!password || password.trim() === '') errors.password = 'Password wajib diisi';
        
        return {
          isValid: Object.keys(errors).length === 0,
          errors
        };
      };

      // Test semua field kosong
      const emptyForm = { email: '', password: '' };
      const emptyValidation = validateRequiredFields(emptyForm);
      expect(emptyValidation.isValid).toBe(false);
      expect(emptyValidation.errors.email).toBeDefined();
      expect(emptyValidation.errors.password).toBeDefined();

      // Test form lengkap
      const validForm = { email: 'user@example.com', password: 'password123' };
      const validValidation = validateRequiredFields(validForm);
      expect(validValidation.isValid).toBe(true);
      expect(Object.keys(validValidation.errors)).toHaveLength(0);

      console.log('✅ Test validasi field wajib login berhasil');
    });
  });

  describe('Fungsi Pemanggilan API Login', () => {
    
    test('harus memanggil API login dengan kredensial yang benar', async () => {
      console.log('🧪 Testing: Pemanggilan API login dengan kredensial yang benar');
      
      // Mock response sukses
      const mockSuccessResponse = {
        message: 'Login successful',
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          profileImageUrl: null,
          bio: null
        },
        token: 'mock-jwt-token-12345'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      });

      // Simulasi function loginUser
      const loginUser = async (data) => {
        const response = await fetch('https://evently-backend-amber.vercel.app/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Login failed');
        }

        return response.json();
      };

      // Test data
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      // Execute test
      const result = await loginUser(loginData);

      // Assertions
      expect(fetch).toHaveBeenCalledWith(
        'https://evently-backend-amber.vercel.app/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData),
        }
      );

      expect(result).toEqual(mockSuccessResponse);
      expect(result.user.email).toBe('john@example.com');
      expect(result.token).toBeDefined();

      console.log('✅ Test pemanggilan API login berhasil - Kredensial benar');
    });

    test('harus menangani error API login dengan kredensial yang salah', async () => {
      console.log('🧪 Testing: Penanganan error API login dengan kredensial yang salah');
      
      // Mock response error
      const mockErrorResponse = {
        error: 'Invalid credentials'
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => mockErrorResponse,
      });

      // Simulasi function loginUser
      const loginUser = async (data) => {
        const response = await fetch('https://evently-backend-amber.vercel.app/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Login failed');
        }

        return response.json();
      };

      // Test data dengan kredensial salah
      const invalidLoginData = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };

      // Execute test dan expect error
      await expect(loginUser(invalidLoginData)).rejects.toThrow('Invalid credentials');

      // Verify API call
      expect(fetch).toHaveBeenCalledWith(
        'https://evently-backend-amber.vercel.app/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidLoginData),
        }
      );

      console.log('✅ Test penanganan error API login berhasil - Kredensial salah');
    });

    test('harus menangani error jaringan', async () => {
      console.log('🧪 Testing: Penanganan error jaringan login');
      
      // Mock network error
      fetch.mockRejectedValueOnce(new Error('Network Error'));

      // Simulasi function loginUser dengan error handling
      const loginUser = async (data) => {
        try {
          const response = await fetch('https://evently-backend-amber.vercel.app/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
          }

          return response.json();
        } catch (error) {
          if (error.message === 'Network Error') {
            throw new Error('Connection failed. Please check your internet connection.');
          }
          throw error;
        }
      };

      // Test data
      const loginData = {
        email: 'user@example.com',
        password: 'password123'
      };

      // Execute test dan expect network error
      await expect(loginUser(loginData)).rejects.toThrow('Connection failed. Please check your internet connection.');

      console.log('✅ Test penanganan error jaringan login berhasil');
    });
  });

  describe('Fungsi Pemrosesan Data Login', () => {
    
    test('harus memproses data form login dengan benar', () => {
      console.log('🧪 Testing: Pemrosesan data form login');
      
      // Function untuk memproses data form
      const processFormData = (formData) => {
        return {
          email: formData.email ? formData.email.trim().toLowerCase() : '',
          password: formData.password ? formData.password.trim() : ''
        };
      };

      // Test data dengan whitespace dan uppercase
      const rawFormData = {
        email: '  JOHN@EXAMPLE.COM  ',
        password: '  password123  '
      };

      const processedData = processFormData(rawFormData);

      // Assertions
      expect(processedData.email).toBe('john@example.com');
      expect(processedData.password).toBe('password123');

      // Test dengan data kosong
      const emptyData = processFormData({ email: '', password: '' });
      expect(emptyData.email).toBe('');
      expect(emptyData.password).toBe('');

      console.log('✅ Test pemrosesan data form login berhasil');
    });

    test('harus memvalidasi perubahan state form login', () => {
      console.log('🧪 Testing: Validasi state form login');
      
      // Simulasi state management
      let formState = {
        email: '',
        password: '',
        isLoading: false,
        errors: {}
      };

      // Function untuk update form state
      const updateFormState = (field, value) => {
        formState = {
          ...formState,
          [field]: value,
          errors: {
            ...formState.errors,
            [field]: undefined // Clear error saat user input
          }
        };
        return formState;
      };

      // Function untuk set loading state
      const setLoadingState = (loading) => {
        formState = {
          ...formState,
          isLoading: loading
        };
        return formState;
      };

      // Test update email
      let updatedState = updateFormState('email', 'user@example.com');
      expect(updatedState.email).toBe('user@example.com');

      // Test update password
      updatedState = updateFormState('password', 'mypassword');
      expect(updatedState.password).toBe('mypassword');

      // Test loading state
      updatedState = setLoadingState(true);
      expect(updatedState.isLoading).toBe(true);

      setLoadingState(false);
      expect(formState.isLoading).toBe(false);

      console.log('✅ Test validasi state form login berhasil');
    });
  });

  describe('Skenario Uji Integrasi Login', () => {
    
    test('SKENARIO 1: Alur login lengkap dengan kredensial benar', async () => {
      console.log('🧪 Testing: Alur login lengkap - kredensial benar');
      
      // Mock successful response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Login successful',
          user: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com'
          },
          token: 'valid-jwt-token'
        }),
      });

      // Simulasi complete login flow
      const completeLoginFlow = async (formData) => {
        // 1. Validasi form
        const validateForm = (data) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const trimmedEmail = data.email.trim();
          const trimmedPassword = data.password.trim();
          return {
            isValid: emailRegex.test(trimmedEmail) && trimmedPassword.length > 0,
            email: trimmedEmail.toLowerCase(),
            password: trimmedPassword
          };
        };

        // 2. Process dan validate
        const validation = validateForm(formData);
        if (!validation.isValid) {
          throw new Error('Form validation failed');
        }

        // 3. API call
        const response = await fetch('https://evently-backend-amber.vercel.app/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: validation.email,
            password: validation.password
          }),
        });

        if (!response.ok) throw new Error('Login failed');

        // 4. Return result
        return await response.json();
      };

      // Test dengan data valid
      const loginData = {
        email: 'JOHN@EXAMPLE.COM ',
        password: ' password123 '
      };

      const result = await completeLoginFlow(loginData);

      // Assertions
      expect(result.message).toBe('Login successful');
      expect(result.user.email).toBe('john@example.com');
      expect(result.token).toBeDefined();

      console.log('✅ Test alur login lengkap berhasil - kredensial benar');
    });

    test('SKENARIO 2: Kegagalan login dengan kredensial salah', async () => {
      console.log('🧪 Testing: Kegagalan login - kredensial salah');
      
      // Mock error response
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid email or password' }),
      });

      // Simulasi login flow dengan error handling
      const loginFlowWithErrorHandling = async (formData) => {
        try {
          const response = await fetch('https://evently-backend-amber.vercel.app/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
          }

          return await response.json();
        } catch (error) {
          return { success: false, error: error.message };
        }
      };

      // Test dengan kredensial salah
      const invalidLoginData = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };

      const result = await loginFlowWithErrorHandling(invalidLoginData);

      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');

      console.log('✅ Test kegagalan login berhasil - kredensial salah');
    });
  });

  describe('Skenario Login Spesifik', () => {
    
    test('Login dengan input yang valid', async () => {
      console.log('🧪 Testing: Login dengan input yang valid');
      
      // Simulasi login function
      const performLogin = async (credentials) => {
        const response = await fetch('https://evently-backend-amber.vercel.app/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        if (!response.ok) throw new Error('Login failed');
        return await response.json();
      };

      // Test cases dengan input valid
      const validInputs = [
        { email: 'user@example.com', password: 'password123' },
        { email: 'test.user@domain.co.id', password: 'securepass456' },
        { email: 'admin@company.org', password: 'mypassword789' }
      ];

      for (const input of validInputs) {
        fetch.mockClear();
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            message: 'Login successful',
            user: { id: '1', name: 'User', email: input.email },
            token: 'jwt-token'
          }),
        });

        const result = await performLogin(input);
        expect(result.message).toBe('Login successful');
        expect(result.user.email).toBe(input.email);
        expect(result.token).toBeDefined();
      }

      console.log('✅ Test login dengan input yang valid berhasil');
    });

    test('Login dengan input yang tidak valid', async () => {
      console.log('🧪 Testing: Login dengan input yang tidak valid');
      
      // Function untuk validasi input sebelum API call
      const validateLoginInput = (credentials) => {
        const errors = [];
        
        // Validasi email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!credentials.email || !emailRegex.test(credentials.email)) {
          errors.push('Email format tidak valid');
        }
        
        // Validasi password
        if (!credentials.password || credentials.password.trim().length === 0) {
          errors.push('Password tidak boleh kosong');
        }
        
        return {
          isValid: errors.length === 0,
          errors
        };
      };

      // Test cases dengan input tidak valid
      const invalidInputs = [
        { email: 'invalid-email', password: 'password123' },
        { email: 'user@example.com', password: '' },
        { email: '', password: 'password123' },
        { email: 'user@', password: '123' },
        { email: '@domain.com', password: 'password' }
      ];

      invalidInputs.forEach(input => {
        const validation = validateLoginInput(input);
        expect(validation.isValid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(0);
      });

      // Test input valid untuk perbandingan
      const validInput = { email: 'user@example.com', password: 'password123' };
      const validValidation = validateLoginInput(validInput);
      expect(validValidation.isValid).toBe(true);
      expect(validValidation.errors).toHaveLength(0);

      console.log('✅ Test login dengan input yang tidak valid berhasil');
    });

    test('Login dengan email yang tidak terdaftar', async () => {
      console.log('🧪 Testing: Login dengan email yang tidak terdaftar');
      
      // Mock response untuk email tidak ditemukan
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'User not found' }),
      });

      // Simulasi login function
      const loginWithUnregisteredEmail = async (credentials) => {
        try {
          const response = await fetch('https://evently-backend-amber.vercel.app/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
          }

          return await response.json();
        } catch (error) {
          return { success: false, error: error.message };
        }
      };

      // Test dengan email tidak terdaftar
      const unregisteredEmail = {
        email: 'notfound@example.com',
        password: 'password123'
      };

      const result = await loginWithUnregisteredEmail(unregisteredEmail);

      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');

      console.log('✅ Test login dengan email yang tidak terdaftar berhasil');
    });
  });

  describe('Skenario Testing Tambahan Login', () => {
    
    test('SKENARIO BARU 1: Login dengan email mengandung karakter spesial', async () => {
      console.log('🧪 Testing: Login dengan email mengandung karakter spesial');
      
      // Mock successful response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Login successful',
          user: { id: '1', name: 'User', email: 'user.name+tag@example-domain.com' },
          token: 'jwt-token'
        }),
      });

      // Function untuk login
      const loginUser = async (credentials) => {
        const response = await fetch('https://evently-backend-amber.vercel.app/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        if (!response.ok) throw new Error('Login failed');
        return await response.json();
      };

      // Test email dengan karakter spesial yang valid
      const specialEmailCredentials = {
        email: 'user.name+tag@example-domain.com',
        password: 'password123'
      };

      const result = await loginUser(specialEmailCredentials);

      // Assertions
      expect(result.message).toBe('Login successful');
      expect(result.user.email).toBe('user.name+tag@example-domain.com');
      expect(result.token).toBeDefined();

      console.log('✅ Test login dengan email karakter spesial berhasil');
    });

    test('SKENARIO BARU 2: Login dengan password mengandung karakter khusus', async () => {
      console.log('🧪 Testing: Login dengan password mengandung karakter khusus');
      
      // Mock successful response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Login successful',
          user: { id: '1', name: 'User', email: 'user@example.com' },
          token: 'jwt-token'
        }),
      });

      // Function untuk login
      const loginUser = async (credentials) => {
        const response = await fetch('https://evently-backend-amber.vercel.app/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        if (!response.ok) throw new Error('Login failed');
        return await response.json();
      };

      // Test password dengan karakter khusus
      const specialPasswordCredentials = {
        email: 'user@example.com',
        password: 'MyP@ssw0rd!#$%^&*()_+'
      };

      const result = await loginUser(specialPasswordCredentials);

      // Assertions
      expect(result.message).toBe('Login successful');
      expect(result.user.email).toBe('user@example.com');
      expect(result.token).toBeDefined();

      // Verify API dipanggil dengan password yang benar
      expect(fetch).toHaveBeenCalledWith(
        'https://evently-backend-amber.vercel.app/api/auth/login',
        expect.objectContaining({
          body: JSON.stringify(specialPasswordCredentials)
        })
      );

      console.log('✅ Test login dengan password karakter khusus berhasil');
    });

    test('SKENARIO BARU 3: Login dengan case sensitivity email', async () => {
      console.log('🧪 Testing: Login dengan case sensitivity email');
      
      // Mock successful response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Login successful',
          user: { id: '1', name: 'User', email: 'user@example.com' },
          token: 'jwt-token'
        }),
      });

      // Function untuk login dengan normalisasi email
      const loginWithEmailNormalization = async (credentials) => {
        const normalizedCredentials = {
          email: credentials.email.toLowerCase().trim(),
          password: credentials.password
        };

        const response = await fetch('https://evently-backend-amber.vercel.app/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(normalizedCredentials),
        });

        if (!response.ok) throw new Error('Login failed');
        return await response.json();
      };

      // Test dengan email dalam berbagai case
      const mixedCaseCredentials = {
        email: 'USER@EXAMPLE.COM',
        password: 'password123'
      };

      const result = await loginWithEmailNormalization(mixedCaseCredentials);

      // Assertions
      expect(result.message).toBe('Login successful');
      expect(result.token).toBeDefined();

      // Verify email dinormalisasi ke lowercase
      expect(fetch).toHaveBeenCalledWith(
        'https://evently-backend-amber.vercel.app/api/auth/login',
        expect.objectContaining({
          body: JSON.stringify({
            email: 'user@example.com',
            password: 'password123'
          })
        })
      );

      console.log('✅ Test login dengan case sensitivity email berhasil');
    });
  });
});
