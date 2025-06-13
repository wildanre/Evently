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
