// Test untuk user profile functions
global.fetch = jest.fn();

describe('User Profile Functions Testing', () => {
  
  beforeEach(() => {
    fetch.mockClear();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(() => 'test-auth-token')
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  test('getUserProfile should fetch user profile correctly', async () => {
    console.log('🧪 Testing: Get user profile function');
    
    const mockProfile = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      profileImageUrl: 'https://example.com/avatar.jpg',
      bio: 'Software Developer',
      createdAt: '2025-01-01',
      _count: {
        events: 5,
        event_participants: 10
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProfile
    });

    const getUserProfile = async () => {
      const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-auth-token'
      });

      const response = await fetch('https://evently-backend-amber.vercel.app/api/users/profile', {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch profile');
      }

      return response.json();
    };

    const result = await getUserProfile();
    
    expect(result.id).toBe('1');
    expect(result.name).toBe('John Doe');
    expect(result.email).toBe('john@example.com');
    expect(result._count.events).toBe(5);
    
    expect(fetch).toHaveBeenCalledWith(
      'https://evently-backend-amber.vercel.app/api/users/profile',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-auth-token'
        })
      })
    );
    
    console.log('✅ Test get user profile berhasil');
  });

  test('updateUserProfile should update profile data', async () => {
    console.log('🧪 Testing: Update user profile function');
    
    const updateData = {
      name: 'Jane Doe',
      bio: 'Updated bio',
      profileImageUrl: 'https://example.com/new-avatar.jpg'
    };

    const mockResponse = {
      id: '1',
      name: 'Jane Doe',
      email: 'john@example.com',
      profileImageUrl: 'https://example.com/new-avatar.jpg',
      bio: 'Updated bio',
      updatedAt: '2025-01-15'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const updateUserProfile = async (data) => {
      const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-auth-token'
      });

      const response = await fetch('https://evently-backend-amber.vercel.app/api/users/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      return response.json();
    };

    const result = await updateUserProfile(updateData);
    
    expect(result.name).toBe('Jane Doe');
    expect(result.bio).toBe('Updated bio');
    expect(result.updatedAt).toBeDefined();
    
    expect(fetch).toHaveBeenCalledWith(
      'https://evently-backend-amber.vercel.app/api/users/profile',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updateData)
      })
    );
    
    console.log('✅ Test update user profile berhasil');
  });

  test('getUserOrganizedEvents should fetch organized events', async () => {
    console.log('🧪 Testing: Get user organized events');
    
    const mockEvents = {
      events: [
        {
          id: '1',
          name: 'My Event',
          startDate: '2025-02-01',
          organizerId: '1'
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEvents
    });

    const getUserOrganizedEvents = async () => {
      const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-auth-token'
      });

      const response = await fetch('https://evently-backend-amber.vercel.app/api/users/organized-events', {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch organized events');
      }

      return response.json();
    };

    const result = await getUserOrganizedEvents();
    
    expect(result.events).toHaveLength(1);
    expect(result.events[0].name).toBe('My Event');
    
    console.log('✅ Test get organized events berhasil');
  });

  test('uploadProfileImage should handle file upload', async () => {
    console.log('🧪 Testing: Upload profile image function');
    
    const mockImageUrl = 'https://cdn.example.com/uploaded-image.jpg';

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ imageUrl: mockImageUrl })
    });

    const uploadProfileImage = async (file) => {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('https://evently-backend-amber.vercel.app/api/users/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-auth-token'
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      return result.imageUrl;
    };

    // Mock File object
    const mockFile = new File([''], 'avatar.jpg', { type: 'image/jpeg' });
    
    const result = await uploadProfileImage(mockFile);
    
    expect(result).toBe(mockImageUrl);
    expect(fetch).toHaveBeenCalledWith(
      'https://evently-backend-amber.vercel.app/api/users/upload-avatar',
      expect.objectContaining({
        method: 'POST'
      })
    );
    
    console.log('✅ Test upload profile image berhasil');
  });

  test('should handle profile API errors', async () => {
    console.log('🧪 Testing: Profile API error handling');
    
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' })
    });

    const getUserProfile = async () => {
      const response = await fetch('https://evently-backend-amber.vercel.app/api/users/profile');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch profile');
      }
      
      return response.json();
    };

    await expect(getUserProfile()).rejects.toThrow('Unauthorized');
    
    console.log('✅ Test profile error handling berhasil');
  });

  test('profile data validation should work correctly', () => {
    console.log('🧪 Testing: Profile data validation');
    
    const validateProfileData = (data) => {
      const errors = [];
      
      if (data.name && data.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
      }
      
      if (data.bio && data.bio.length > 500) {
        errors.push('Bio must be less than 500 characters');
      }
      
      if (data.profileImageUrl && !data.profileImageUrl.startsWith('http')) {
        errors.push('Profile image must be a valid URL');
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    };

    // Test valid data
    const validData = {
      name: 'John Doe',
      bio: 'Software developer',
      profileImageUrl: 'https://example.com/avatar.jpg'
    };
    
    const validResult = validateProfileData(validData);
    expect(validResult.isValid).toBe(true);
    expect(validResult.errors).toHaveLength(0);

    // Test invalid data
    const invalidData = {
      name: 'A',
      bio: 'x'.repeat(501),
      profileImageUrl: 'invalid-url'
    };
    
    const invalidResult = validateProfileData(invalidData);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors).toHaveLength(3);
    
    console.log('✅ Test profile validation berhasil');
  });
});
