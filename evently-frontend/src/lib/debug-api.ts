// Debug script to check API configuration
// Add this to any component to debug API URL

export function debugApiConfig() {
  console.log('=== API Configuration Debug ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === 'production' 
      ? 'https://evently-backend-amber.vercel.app' 
      : 'http://localhost:8000');
      
  console.log('Final API_BASE_URL:', API_BASE_URL);
  console.log('Events Endpoint:', `${API_BASE_URL}/api/events`);
  console.log('===============================');
}
