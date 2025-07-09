// API configuration for different environments
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === 'production' 
    ? 'https://evently-backend-amber.vercel.app' 
    : 'http://localhost:8000');

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  EVENTS: `${API_BASE_URL}/api/events`,
  AUTH: `${API_BASE_URL}/api/auth`,
  USERS: `${API_BASE_URL}/api/users`,
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,
  PAYMENTS: `${API_BASE_URL}/api/payments`,
};

// Debug log to check which URL is being used
console.log('API Base URL:', API_BASE_URL);
console.log('Events Endpoint:', API_ENDPOINTS.EVENTS);

export default API_BASE_URL;
