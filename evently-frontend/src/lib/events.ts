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

export interface EventCategory {
  id: string;
  name: string;
  count: number;
  icon: string;
  color: string;
}

export interface DiscoverData {
  categories: EventCategory[];
  featuredEvents: Event[];
  trendingEvents: Event[];
  localEvents: Event[];
}

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

export async function getFeaturedEvents(limit = 4): Promise<Event[]> {
  const response = await fetch(`${API_BASE_URL}/events?limit=${limit}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch featured events');
  }
  
  const data = await response.json();
  // Sort by attendee count client-side since backend doesn't support this sort
  const sortedEvents = data.events.sort((a: Event, b: Event) => b.attendeeCount - a.attendeeCount);
  return sortedEvents;
}

export async function getEventsByCategory(category: string, limit = 4): Promise<Event[]> {
  const response = await fetch(`${API_BASE_URL}/events?tags=${category}&limit=${limit}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch category events');
  }
  
  const data = await response.json();
  return data.events;
}

export async function getUpcomingEvents(limit = 4): Promise<Event[]> {
  const response = await fetch(`${API_BASE_URL}/events?limit=${limit}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch upcoming events');
  }
  
  const data = await response.json();
  return data.events;
}

export async function getEventCategories(): Promise<EventCategory[]> {
  const categories = [
    { id: 'technology', name: 'Technology', icon: 'Code', color: 'bg-blue-500' },
    { id: 'business', name: 'Business', icon: 'Briefcase', color: 'bg-green-500' },
    { id: 'design', name: 'Design', icon: 'Palette', color: 'bg-purple-500' },
    { id: 'music', name: 'Music', icon: 'Music', color: 'bg-pink-500' },
    { id: 'health', name: 'Health & Wellness', icon: 'Heart', color: 'bg-red-500' },
    { id: 'gaming', name: 'Gaming', icon: 'Gamepad2', color: 'bg-indigo-500' },
    { id: 'education', name: 'Education', icon: 'BookOpen', color: 'bg-yellow-500' },
    { id: 'social', name: 'Social', icon: 'Coffee', color: 'bg-orange-500' },
  ];

  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      try {
        const response = await fetch(`${API_BASE_URL}/events?tags=${category.id}&limit=1`);
        if (response.ok) {
          const data = await response.json();
          return { ...category, count: data.pagination.total };
        }
        return { ...category, count: 0 };
      } catch (error) {
        return { ...category, count: 0 };
      }
    })
  );

  return categoriesWithCounts;
}

