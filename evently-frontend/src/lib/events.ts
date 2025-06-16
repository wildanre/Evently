const API_BASE_URL = "https://evently-backend-amber.vercel.app/api";

export interface Event {
  id: string;
  name: string;
  description?: string;
  location?: string;
  visibility: boolean;
  tags: string[];
  imageUrl?: string;
  status: string;
  requireApproval: boolean;
  capacity?: number;
  attendeeCount: number;
  startDate: string;
  endDate: string;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
  users: {
    id: string;
    name: string;
    email: string;
    profileImageUrl?: string;
  };
  _count: {
    event_participants_event_participants_eventIdToevents: number;
  };
}

export interface EventsResponse {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EventFilters {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string;
}

// Get all events with optional filters
export async function getEvents(filters?: EventFilters): Promise<EventsResponse> {
  const searchParams = new URLSearchParams();
  
  if (filters?.page) searchParams.append('page', filters.page.toString());
  if (filters?.limit) searchParams.append('limit', filters.limit.toString());
  if (filters?.search) searchParams.append('search', filters.search);
  if (filters?.tags) searchParams.append('tags', filters.tags);

  const response = await fetch(`${API_BASE_URL}/events?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  
  return response.json();
}

export async function getEvent(id: string): Promise<Event> {
  const response = await fetch(`${API_BASE_URL}/events/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch event');
  }
  
  return response.json();
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
}

export async function registerForEvent(eventId: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to register for event');
  }
  
  return response.json();
}

export async function unregisterFromEvent(eventId: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to unregister from event');
  }
  
  return response.json();
}

