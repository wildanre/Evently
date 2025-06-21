/**
 * @jest-environment jsdom
 */

import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  formatNotificationTime,
  getNotificationIcon,
  NotificationType
} from '../src/lib/notifications';

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  },
  writable: true
});

describe('Notifications Functions', () => {
  const mockToken = 'mock-auth-token';
  
  beforeEach(() => {
    fetch.mockClear();
    window.localStorage.getItem.mockClear();
    window.localStorage.getItem.mockReturnValue(mockToken);
  });

  describe('getNotifications', () => {
    it('should fetch notifications successfully', async () => {
      const mockResponse = {
        notifications: [
          {
            id: '1',
            title: 'Test Notification',
            message: 'Test message',
            type: NotificationType.GENERAL,
            isRead: false,
            userId: 'user1',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getNotifications();

      expect(fetch).toHaveBeenCalledWith(
        'https://evently-backend-amber.vercel.app/api/notifications',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle query parameters correctly', async () => {
      const mockResponse = {
        notifications: [],
        pagination: { page: 2, limit: 5, total: 0, totalPages: 0 }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const filters = {
        page: 2,
        limit: 5,
        isRead: true,
        type: NotificationType.EVENT_REMINDER
      };

      await getNotifications(filters);

      expect(fetch).toHaveBeenCalledWith(
        'https://evently-backend-amber.vercel.app/api/notifications?page=2&limit=5&isRead=true&type=EVENT_REMINDER',
        expect.any(Object)
      );
    });

    it('should throw error when not authenticated', async () => {
      window.localStorage.getItem.mockReturnValue(null);

      await expect(getNotifications()).rejects.toThrow('Authentication required');
    });

    it('should throw error on API failure', async () => {
      const mockError = { error: 'Server error' };

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => mockError
      });

      await expect(getNotifications()).rejects.toThrow('Server error');
    });
  });

  describe('getUnreadNotificationsCount', () => {
    it('should fetch unread count successfully', async () => {
      const mockResponse = { count: 5 };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getUnreadNotificationsCount();

      expect(fetch).toHaveBeenCalledWith(
        'https://evently-backend-amber.vercel.app/api/notifications/unread-count',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when not authenticated', async () => {
      window.localStorage.getItem.mockReturnValue(null);

      await expect(getUnreadNotificationsCount()).rejects.toThrow('Authentication required');
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const mockNotification = {
        id: '1',
        title: 'Test',
        message: 'Test message',
        type: NotificationType.GENERAL,
        isRead: true,
        userId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotification
      });

      const result = await markNotificationAsRead('1');

      expect(fetch).toHaveBeenCalledWith(
        'https://evently-backend-amber.vercel.app/api/notifications/1/read',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          }
        }
      );
      expect(result).toEqual(mockNotification);
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read successfully', async () => {
      const mockResponse = { message: 'All notifications marked as read' };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await markAllNotificationsAsRead();

      expect(fetch).toHaveBeenCalledWith(
        'https://evently-backend-amber.vercel.app/api/notifications/mark-all-read',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      const mockResponse = { message: 'Notification deleted' };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await deleteNotification('1');

      expect(fetch).toHaveBeenCalledWith(
        'https://evently-backend-amber.vercel.app/api/notifications/1',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('formatNotificationTime', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(now);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "Just now" for very recent notifications', () => {
      const recentTime = new Date('2024-01-01T11:59:30Z').toISOString();
      const result = formatNotificationTime(recentTime);
      expect(result).toBe('Just now');
    });

    it('should return minutes ago for recent notifications', () => {
      const minutesAgo = new Date('2024-01-01T11:45:00Z').toISOString();
      const result = formatNotificationTime(minutesAgo);
      expect(result).toBe('15m ago');
    });

    it('should return hours ago for notifications within a day', () => {
      const hoursAgo = new Date('2024-01-01T09:00:00Z').toISOString();
      const result = formatNotificationTime(hoursAgo);
      expect(result).toBe('3h ago');
    });

    it('should return days ago for notifications within a week', () => {
      const daysAgo = new Date('2023-12-30T12:00:00Z').toISOString();
      const result = formatNotificationTime(daysAgo);
      expect(result).toBe('2d ago');
    });

    it('should return formatted date for older notifications', () => {
      const oldDate = new Date('2023-12-01T12:00:00Z').toISOString();
      const result = formatNotificationTime(oldDate);
      expect(result).toBe('Dec 1');
    });
  });

  describe('getNotificationIcon', () => {
    it('should return correct icons for each notification type', () => {
      expect(getNotificationIcon(NotificationType.EVENT_CREATED)).toBe('🎉');
      expect(getNotificationIcon(NotificationType.EVENT_UPDATED)).toBe('📝');
      expect(getNotificationIcon(NotificationType.EVENT_CANCELLED)).toBe('❌');
      expect(getNotificationIcon(NotificationType.EVENT_REMINDER)).toBe('⏰');
      expect(getNotificationIcon(NotificationType.REGISTRATION_CONFIRMED)).toBe('✅');
      expect(getNotificationIcon(NotificationType.REGISTRATION_APPROVED)).toBe('👍');
      expect(getNotificationIcon(NotificationType.REGISTRATION_REJECTED)).toBe('👎');
      expect(getNotificationIcon(NotificationType.FEEDBACK_REQUEST)).toBe('💭');
      expect(getNotificationIcon(NotificationType.GENERAL)).toBe('📢');
    });

    it('should return default icon for unknown types', () => {
      const unknownType = 'UNKNOWN_TYPE';
      expect(getNotificationIcon(unknownType)).toBe('📢');
    });
  });
});
