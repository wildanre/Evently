const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ;

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  userId: string;
  eventId?: string;
  createdAt: string;
  updatedAt: string;
  events?: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    location?: string;
  };
}

export enum NotificationType {
  EVENT_CREATED = 'EVENT_CREATED',
  EVENT_UPDATED = 'EVENT_UPDATED',
  EVENT_CANCELLED = 'EVENT_CANCELLED',
  EVENT_REMINDER = 'EVENT_REMINDER',
  REGISTRATION_CONFIRMED = 'REGISTRATION_CONFIRMED',
  REGISTRATION_APPROVED = 'REGISTRATION_APPROVED',
  REGISTRATION_REJECTED = 'REGISTRATION_REJECTED',
  FEEDBACK_REQUEST = 'FEEDBACK_REQUEST',
  GENERAL = 'GENERAL'
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  count: number;
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

export async function getNotifications(filters: NotificationFilters = {}): Promise<NotificationResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const queryParams = new URLSearchParams();
  
  if (filters.page) queryParams.append('page', filters.page.toString());
  if (filters.limit) queryParams.append('limit', filters.limit.toString());
  if (filters.isRead !== undefined) queryParams.append('isRead', filters.isRead.toString());
  if (filters.type) queryParams.append('type', filters.type);

  const url = `${API_BASE_URL}/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export async function getUnreadNotificationsCount(): Promise<UnreadCountResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export async function markAllNotificationsAsRead(): Promise<{ message: string }> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteNotification(notificationId: string): Promise<{ message: string }> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export function formatNotificationTime(createdAt: string): string {
  const now = new Date();
  const notificationDate = new Date(createdAt);
  const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  } else if (diffInMinutes < 10080) {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}d ago`;
  } else {
    return notificationDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
}

export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case NotificationType.EVENT_CREATED:
      return '🎉';
    case NotificationType.EVENT_UPDATED:
      return '📝';
    case NotificationType.EVENT_CANCELLED:
      return '❌';
    case NotificationType.EVENT_REMINDER:
      return '⏰';
    case NotificationType.REGISTRATION_CONFIRMED:
      return '✅';
    case NotificationType.REGISTRATION_APPROVED:
      return '👍';
    case NotificationType.REGISTRATION_REJECTED:
      return '👎';
    case NotificationType.FEEDBACK_REQUEST:
      return '💭';
    case NotificationType.GENERAL:
    default:
      return '📢';
  }
}

