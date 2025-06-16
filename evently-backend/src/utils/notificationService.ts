import { prisma } from './prisma';
import { NotificationType, CreateNotificationData } from '../types';

export class NotificationService {
  /**
   * Create a notification for a specific user
   */
  static async createNotification(data: CreateNotificationData) {
    try {
      const notification = await prisma.notifications.create({
        data: {
          title: data.title,
          message: data.message,
          type: data.type,
          userId: data.userId,
          eventId: data.eventId,
        },
        include: {
          events: {
            select: {
              id: true,
              name: true,
              startDate: true,
              endDate: true,
              location: true
            }
          }
        }
      });
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create notifications for multiple users
   */
  static async createBulkNotifications(
    userIds: string[],
    title: string,
    message: string,
    type: NotificationType,
    eventId?: string
  ) {
    try {
      const notificationData = userIds.map(userId => ({
        title,
        message,
        type,
        userId,
        eventId,
      }));

      const notifications = await prisma.notifications.createMany({
        data: notificationData,
      });

      return notifications;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  /**
   * Send event registration confirmation notification
   */
  static async sendRegistrationConfirmation(userId: string, eventId: string) {
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      select: { name: true, startDate: true, location: true }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const startDate = new Date(event.startDate);
    const formattedDate = startDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return this.createNotification({
      title: 'Registration Confirmed',
      message: `Your registration for "${event.name}" has been confirmed. The event will take place on ${formattedDate}${event.location ? ` at ${event.location}` : ''}.`,
      type: NotificationType.REGISTRATION_CONFIRMED,
      userId,
      eventId
    });
  }

  /**
   * Send event creation notification to organizer
   */
  static async sendEventCreatedNotification(organizerId: string, eventId: string) {
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      select: { name: true }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    return this.createNotification({
      title: 'Event Created Successfully',
      message: `Your event "${event.name}" has been created and published successfully.`,
      type: NotificationType.EVENT_CREATED,
      userId: organizerId,
      eventId
    });
  }

  /**
   * Send event update notification to participants
   */
  static async sendEventUpdateNotification(eventId: string, updateMessage?: string) {
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      include: {
        event_participants_event_participants_eventIdToevents: {
          select: { userId: true }
        }
      }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const participantIds = event.event_participants_event_participants_eventIdToevents
      .map(p => p.userId);

    if (participantIds.length === 0) {
      return;
    }

    const message = updateMessage || `The event "${event.name}" has been updated. Please check the event details for changes.`;

    return this.createBulkNotifications(
      participantIds,
      'Event Updated',
      message,
      NotificationType.EVENT_UPDATED,
      eventId
    );
  }

  /**
   * Send event cancellation notification to participants
   */
  static async sendEventCancellationNotification(eventId: string, reason?: string) {
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      include: {
        event_participants_event_participants_eventIdToevents: {
          select: { userId: true }
        }
      }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const participantIds = event.event_participants_event_participants_eventIdToevents
      .map(p => p.userId);

    if (participantIds.length === 0) {
      return;
    }

    const message = reason 
      ? `The event "${event.name}" has been cancelled. Reason: ${reason}`
      : `The event "${event.name}" has been cancelled.`;

    return this.createBulkNotifications(
      participantIds,
      'Event Cancelled',
      message,
      NotificationType.EVENT_CANCELLED,
      eventId
    );
  }

  /**
   * Send event reminder notification
   */
  static async sendEventReminderNotification(eventId: string, hoursBeforeEvent: number = 24) {
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      include: {
        event_participants_event_participants_eventIdToevents: {
          select: { userId: true }
        }
      }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const participantIds = event.event_participants_event_participants_eventIdToevents
      .map(p => p.userId);

    if (participantIds.length === 0) {
      return;
    }

    const startDate = new Date(event.startDate);
    const formattedDate = startDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const message = `Reminder: The event "${event.name}" is starting in ${hoursBeforeEvent} hours on ${formattedDate}${event.location ? ` at ${event.location}` : ''}. Don't miss it!`;

    return this.createBulkNotifications(
      participantIds,
      'Event Reminder',
      message,
      NotificationType.EVENT_REMINDER,
      eventId
    );
  }

  /**
   * Send feedback request notification
   */
  static async sendFeedbackRequestNotification(eventId: string) {
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      include: {
        event_participants_event_participants_eventIdToevents: {
          select: { userId: true }
        }
      }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const participantIds = event.event_participants_event_participants_eventIdToevents
      .map(p => p.userId);

    if (participantIds.length === 0) {
      return;
    }

    const message = `Thank you for attending "${event.name}"! We'd love to hear your feedback about the event.`;

    return this.createBulkNotifications(
      participantIds,
      'Share Your Feedback',
      message,
      NotificationType.FEEDBACK_REQUEST,
      eventId
    );
  }
}

