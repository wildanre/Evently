// API utility with authentication support

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

export async function apiRequest(url: string, options: ApiRequestOptions = {}) {
  const token = localStorage.getItem('auth_token');
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if token exists
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: options.method || 'GET',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (options.body && options.method !== 'GET') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  // Handle authentication errors
  if (response.status === 401) {
    // Clear invalid token
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Redirect to login or throw error
    throw new Error('Authentication required. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Specific API methods
export const api = {
  // Event methods
  events: {
    create: (eventData: any) => apiRequest('/api/events', {
      method: 'POST',
      body: eventData
    }),
    getAll: (params?: any) => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiRequest(`/api/events${queryString}`);
    },
    getById: (id: string) => apiRequest(`/api/events/${id}`),
    update: (id: string, eventData: any) => apiRequest(`/api/events/${id}`, {
      method: 'PUT',
      body: eventData
    }),
    delete: (id: string) => apiRequest(`/api/events/${id}`, {
      method: 'DELETE'
    })
  },

  // Auth methods
  auth: {
    login: (credentials: any) => apiRequest('/api/auth/login', {
      method: 'POST',
      body: credentials
    }),
    register: (userData: any) => apiRequest('/api/auth/register', {
      method: 'POST', 
      body: userData
    }),
    logout: () => apiRequest('/api/auth/logout', {
      method: 'POST'
    })
  }
};
