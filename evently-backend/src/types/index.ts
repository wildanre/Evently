import { Request } from 'express';

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  profileImageUrl?: string | null;
  bio?: string | null;
}

// Auth types
export interface AuthRequest extends Request {
  user?: Express.User;
}

// Event types
export interface Event {
  id: string;
  name: string;
  description?: string;
  location?: string;
  visibility: boolean;
  tags: string[];
  imageUrl?: string;
  status: EventStatus;
  requireApproval: boolean;
  capacity?: number;
  attendeeCount: number;
  startDate: Date;
  endDate: Date;
  registrationStartDate: Date;
  registrationEndDate?: Date;
  organizerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enums
export enum EventRole {
  ATTENDEE = 'ATTENDEE',
  SPEAKER = 'SPEAKER',
  ORGANIZER = 'ORGANIZER',
  MANAGER = 'MANAGER'
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export enum RegistrationStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  WAITLIST = 'WAITLIST'
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

// Event Participant types
export interface EventParticipant {
  id: string;
  role: EventRole;
  status: string;
  eventId: string;
  userId: string;
  registeredAt: Date;
  updatedAt: Date;
}

// Event Feedback types
export interface EventFeedback {
  id: string;
  rating: number;
  comment?: string;
  eventId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  userId: string;
  eventId?: string;
  createdAt: Date;
  updatedAt: Date;
  event?: Event;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth response types
export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

// Event query filters
export interface EventFilters {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string;
  status?: EventStatus;
  organizerId?: string;
}

// Create/Update types
export interface CreateEventData {
  name: string;
  description?: string;
  location?: string;
  startDate: string | Date;
  endDate: string | Date;
  capacity?: number;
  tags?: string[];
  visibility?: boolean;
  requireApproval?: boolean;
  imageUrl?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {}

export interface CreateUserData {
  name: string;
  email: string;
  password?: string;
  profileImageUrl?: string;
  bio?: string;
}

export interface UpdateUserData {
  name?: string;
  bio?: string;
  profileImageUrl?: string;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type: NotificationType;
  userId: string;
  eventId?: string;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
}

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  error: string;
  errors?: ValidationError[];
  status: number;
}
