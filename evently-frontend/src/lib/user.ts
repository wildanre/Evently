import { getAuthHeaders } from './auth';

const API_BASE_URL = "https://evently-backend-amber.vercel.app/api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profileImageUrl?: string | null;
  bio?: string | null;
  createdAt: string;
  _count: {
    events: number;
    event_participants: number;
  };
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  profileImageUrl?: string;
}

export interface UpdateProfileResponse {
  id: string;
  name: string;
  email: string;
  profileImageUrl: string | null;
  bio: string | null;
  updatedAt: string;
}

// Get user profile
export async function getUserProfile(): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch profile');
  }

  return response.json();
}

// Update user profile
export async function updateUserProfile(data: UpdateProfileData): Promise<UpdateProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update profile');
  }

  return response.json();
}

// Get user's organized events
export async function getUserOrganizedEvents() {
  const response = await fetch(`${API_BASE_URL}/users/organized-events`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch organized events');
  }

  return response.json();
}

// Get user's registered events
export async function getUserRegisteredEvents() {
  const response = await fetch(`${API_BASE_URL}/users/registered-events`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch registered events');
  }

  return response.json();
}

// Upload profile image (placeholder - you'll need to implement file upload endpoint)
export async function uploadProfileImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/users/upload-avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload image');
  }

  const result = await response.json();
  return result.url;
}

