import express, { Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { prisma } from '../utils/prisma';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { 
  AuthRequest, 
  CreateEventData, 
  UpdateEventData, 
  EventFilters,
  PaginationResponse,
  NotificationType 
} from '../types';
import { NotificationService } from '../utils/notificationService';

const router: express.Router = express.Router();

// Helper function to determine event status
function getEventStatus(startDate: Date, endDate: Date): 'upcoming' | 'ongoing' | 'past' {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'ongoing';
  return 'past';
}

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events with filtering and pagination
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma separated tags
 *     responses:
 *       200:
 *         description: List of events
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().trim(),
  query('tags').optional().isString()
], optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const tagsQuery = req.query.tags as string;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 'PUBLISHED',
      visibility: true
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (tagsQuery) {
      const tags = tagsQuery.split(',').map(tag => tag.trim());
      where.tags = { hasSome: tags };
    }

    const [events, total] = await Promise.all([
      prisma.events.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
        include: {
          users: {
            select: { id: true, name: true, email: true }
          },
          event_participants_event_participants_eventIdToevents: {
            include: {
              users: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          _count: { select: { event_participants_event_participants_eventIdToevents: true } }
        }
      }),
      prisma.events.count({ where })
    ]);

    // Transform events to include organizer and participants in a cleaner format
    const transformedEvents = events.map(event => ({
      ...event,
      organizer: event.users,
      participants: event.event_participants_event_participants_eventIdToevents,
      attendeeCount: event._count.event_participants_event_participants_eventIdToevents
    }));

    res.json({
      events: transformedEvents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/events/my-joined:
 *   get:
 *     summary: Get events the current user has joined
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of events user has joined
 *       401:
 *         description: Unauthorized
 */
router.get('/my-joined', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const userEvents = await prisma.event_participants.findMany({
      where: { 
        userId,
        role: 'ATTENDEE',
        status: { in: ['confirmed', 'pending', 'rejected'] } // Include confirmed, pending, and rejected
      },
      include: {
        events_event_participants_eventIdToevents: {
          include: {
            users: {
              select: { name: true }
            },
            _count: {
              select: { 
                event_participants_event_participants_eventIdToevents: {
                  where: { status: 'confirmed' }
                }
              }
            }
          }
        }
      },
      orderBy: { registeredAt: 'desc' }
    });

    const events = userEvents.map(participant => ({
      id: participant.events_event_participants_eventIdToevents.id,
      name: participant.events_event_participants_eventIdToevents.name,
      description: participant.events_event_participants_eventIdToevents.description,
      location: participant.events_event_participants_eventIdToevents.location,
      startDate: participant.events_event_participants_eventIdToevents.startDate,
      endDate: participant.events_event_participants_eventIdToevents.endDate,
      imageUrl: participant.events_event_participants_eventIdToevents.imageUrl,
      tags: participant.events_event_participants_eventIdToevents.tags,
      capacity: participant.events_event_participants_eventIdToevents.capacity,
      attendeeCount: participant.events_event_participants_eventIdToevents._count.event_participants_event_participants_eventIdToevents,
      organizerName: participant.events_event_participants_eventIdToevents.users.name,
      joinedAt: participant.registeredAt,
      participantStatus: participant.status, // Add participant status (confirmed/pending)
      status: getEventStatus(participant.events_event_participants_eventIdToevents.startDate, participant.events_event_participants_eventIdToevents.endDate)
    }));

    res.json({ events });
  } catch (error) {
    console.error('Get my joined events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/events/my-created:
 *   get:
 *     summary: Get events created by the current user
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of events created by user
 *       401:
 *         description: Unauthorized
 */
router.get('/my-created', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const createdEvents = await prisma.events.findMany({
      where: { organizerId: userId },
      include: {
        users: {
          select: { name: true }
        },
        _count: {
          select: { 
            event_participants_event_participants_eventIdToevents: {
              where: { status: 'confirmed' }
            }
          }
        },
        event_participants_event_participants_eventIdToevents: {
          where: { status: 'pending' },
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const events = createdEvents.map(event => ({
      id: event.id,
      name: event.name,
      description: event.description,
      location: event.location,
      startDate: event.startDate,
      endDate: event.endDate,
      imageUrl: event.imageUrl,
      tags: event.tags,
      capacity: event.capacity,
      attendeesCount: event._count.event_participants_event_participants_eventIdToevents,
      pendingCount: event.event_participants_event_participants_eventIdToevents.length,
      requireApproval: event.requireApproval,
      visibility: event.visibility,
      status: getEventStatus(event.startDate, event.endDate)
    }));

    res.json(events);
  } catch (error) {
    console.error('Get my created events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get single event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event detail
 *       404:
 *         description: Event not found
 */
router.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.events.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, name: true, email: true, profileImageUrl: true }
        },
        event_participants_event_participants_eventIdToevents: {
          include: {
            users: {
              select: { id: true, name: true, profileImageUrl: true }
            }
          }
        },
        event_feedback: {
          include: {
            users: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if event is private and user is not authorized
    if (!event.visibility && (!req.user || (req.user.id !== event.organizerId))) {
      return res.status(403).json({ error: 'Access denied to private event' });
    }

    // Transform the response to include cleaner structure
    const transformedEvent = {
      ...event,
      organizer: event.users,
      participants: event.event_participants_event_participants_eventIdToevents
    };

    res.json({ event: transformedEvent });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 description: Event name
 *                 example: "Tech Conference 2025"
 *               description:
 *                 type: string
 *                 description: Event description
 *                 example: "Annual technology conference featuring latest trends"
 *               location:
 *                 type: string
 *                 description: Event location
 *                 example: "Jakarta Convention Center"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Event start date and time
 *                 example: "2025-07-15T09:00:00Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Event end date and time
 *                 example: "2025-07-15T17:00:00Z"
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Maximum number of attendees
 *                 example: 100
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Event tags
 *                 example: ["technology", "conference", "networking"]
 *               visibility:
 *                 type: boolean
 *                 description: Event visibility
 *                 default: true
 *                 example: true
 *               requireApproval:
 *                 type: boolean
 *                 description: Whether event requires approval to join
 *                 default: false
 *                 example: false
 *               imageUrl:
 *                 type: string
 *                 description: Event image URL
 *                 example: "https://example.com/event-image.jpg"
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "clx123abc456"
 *                 name:
 *                   type: string
 *                   example: "Tech Conference 2025"
 *                 description:
 *                   type: string
 *                   example: "Annual technology conference featuring latest trends"
 *                 location:
 *                   type: string
 *                   example: "Jakarta Convention Center"
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-15T09:00:00Z"
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-15T17:00:00Z"
 *                 capacity:
 *                   type: integer
 *                   example: 100
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["technology", "conference", "networking"]
 *                 visibility:
 *                   type: boolean
 *                   example: true
 *                 requireApproval:
 *                   type: boolean
 *                   example: false
 *                 imageUrl:
 *                   type: string
 *                   example: "https://example.com/event-image.jpg"
 *                 status:
 *                   type: string
 *                   enum: [DRAFT, PUBLISHED, CANCELLED, COMPLETED]
 *                   example: "PUBLISHED"
 *                 attendeeCount:
 *                   type: integer
 *                   example: 0
 *                 organizerId:
 *                   type: string
 *                   example: "clx456def789"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-16T10:30:00Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-16T10:30:00Z"
 *                 organizer:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "clx456def789"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *       400:
 *         description: Bad request - validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *                   example:
 *                     - field: "name"
 *                       message: "Event name is required"
 *                     - field: "startDate"
 *                       message: "Valid start date is required"
 *                 error:
 *                   type: string
 *                   example: "Start date must be before end date"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Authentication required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
// Create new event
router.post('/', [
  body('name').trim().isLength({ min: 1 }).withMessage('Event name is required'),
  body('description').optional().isString(),
  body('location').optional().isString(),
  body('mapsLink').optional().isURL().withMessage('Maps link must be a valid URL'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be positive'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('visibility').optional().isBoolean(),
  body('requireApproval').optional().isBoolean()
], authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      location,
      mapsLink,
      startDate,
      endDate,
      capacity,
      tags,
      visibility = true,
      requireApproval = false,
      imageUrl
    } = req.body;

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }

    const event = await prisma.events.create({
      data: {
        name,
        description,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        capacity,
        tags: tags || [],
        visibility,
        requireApproval,
        imageUrl,
        organizerId: req.user!.id
      },
      include: {
        users: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Send notification to organizer
    try {
      await NotificationService.sendEventCreatedNotification(req.user!.id, event.id);
    } catch (notificationError) {
      console.error('Failed to send event created notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update event
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Event name cannot be empty'),
  body('description').optional().isString(),
  body('location').optional().isString(),
  body('mapsLink').optional().isURL().withMessage('Maps link must be a valid URL'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be positive'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('visibility').optional().isBoolean(),
  body('requireApproval').optional().isBoolean()
], authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    // Check if event exists and user is organizer
    const existingEvent = await prisma.events.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existingEvent.organizerId !== req.user!.id) {
      return res.status(403).json({ error: 'Only event organizer can update this event' });
    }

    // Validate dates if provided
    const startDate = updates.startDate ? new Date(updates.startDate) : existingEvent.startDate;
    const endDate = updates.endDate ? new Date(updates.endDate) : existingEvent.endDate;

    if (startDate >= endDate) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }

    const updatedEvent = await prisma.events.update({
      where: { id },
      data: {
        ...updates,
        startDate: updates.startDate ? new Date(updates.startDate) : undefined,
        endDate: updates.endDate ? new Date(updates.endDate) : undefined
      },
      include: {
        users: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Send notification to participants about event update
    try {
      await NotificationService.sendEventUpdateNotification(id);
    } catch (notificationError) {
      console.error('Failed to send event update notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.json(updatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete event
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.events.findUnique({
      where: { id }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.organizerId !== req.user!.id) {
      return res.status(403).json({ error: 'Only event organizer can delete this event' });
    }

    await prisma.events.delete({
      where: { id }
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register for event
router.post('/:id/register', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.events.findUnique({
      where: { id },
      include: { 
        _count: { 
          select: { 
            event_participants_event_participants_eventIdToevents: {
              where: { status: 'confirmed' }
            }
          } 
        } 
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if event is full
    if (event.capacity && event._count.event_participants_event_participants_eventIdToevents >= event.capacity) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Check if user is already registered
    const existingRegistration = await prisma.event_participants.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: req.user!.id
        }
      }
    });

    if (existingRegistration) {
      // If user was rejected, allow them to re-register by updating the existing record
      if (existingRegistration.status === 'rejected') {
        const registrationStatus = event.requireApproval ? 'pending' : 'confirmed';
        
        await prisma.event_participants.update({
          where: {
            eventId_userId: {
              eventId: id,
              userId: req.user!.id
            }
          },
          data: {
            status: registrationStatus,
            registeredAt: new Date() // Update registration time
          }
        });

        // Only update attendee count if automatically confirmed
        if (!event.requireApproval) {
          await prisma.events.update({
            where: { id },
            data: { attendeeCount: { increment: 1 } }
          });
        }

        const message = event.requireApproval 
          ? 'Re-registration submitted! Awaiting organizer approval.'
          : 'Successfully re-registered for event';
        
        return res.json({ 
          message, 
          requireApproval: event.requireApproval,
          status: registrationStatus
        });
      } else {
        return res.status(400).json({ error: 'Already registered for this event' });
      }
    }

    // Register user as ATTENDEE
    const registrationStatus = event.requireApproval ? 'pending' : 'confirmed';
    
    await prisma.event_participants.create({
      data: {
        eventId: id,
        userId: req.user!.id,
        role: 'ATTENDEE',
        status: registrationStatus
      }
    });

    // Only update attendee count if automatically confirmed
    if (!event.requireApproval) {
      await prisma.events.update({
        where: { id },
        data: { attendeeCount: { increment: 1 } }
      });
    }

    // Send registration confirmation notification
    try {
      await NotificationService.sendRegistrationConfirmation(req.user!.id, id);
    } catch (notificationError) {
      console.error('Failed to send registration confirmation notification:', notificationError);
      // Don't fail the request if notification fails
    }

    const message = event.requireApproval 
      ? 'Registration submitted! Awaiting organizer approval.'
      : 'Successfully registered for event';
    
    res.json({ 
      message, 
      requireApproval: event.requireApproval,
      status: registrationStatus
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unregister from event
router.delete('/:id/register', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await prisma.event_participants.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: req.user!.id
        }
      }
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    await prisma.event_participants.delete({
      where: {
        eventId_userId: {
          eventId: id,
          userId: req.user!.id
        }
      }
    });

    // Update attendee count
    await prisma.events.update({
      where: { id },
      data: { attendeeCount: { decrement: 1 } }
    });

    res.json({ message: 'Successfully unregistered from event' });
  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/events/{id}/attendees:
 *   get:
 *     summary: Get attendees for an event (only for event organizer)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: List of event attendees
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the event organizer
 *       404:
 *         description: Event not found
 */
router.get('/:id/attendees', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if user is the organizer of this event
    const event = await prisma.events.findUnique({
      where: { id },
      select: { organizerId: true }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.organizerId !== userId) {
      return res.status(403).json({ error: 'Only event organizer can view attendees' });
    }

    const attendees = await prisma.event_participants.findMany({
      where: { eventId: id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { registeredAt: 'desc' }
    });

    const formattedAttendees = attendees.map(participant => ({
      id: participant.users.id,
      name: participant.users.name,
      email: participant.users.email,
      status: participant.status,
      joinedAt: participant.registeredAt
    }));

    res.json(formattedAttendees);
  } catch (error) {
    console.error('Get event attendees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/events/{id}/attendees/{attendeeId}/approve:
 *   post:
 *     summary: Approve an attendee registration
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *       - in: path
 *         name: attendeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendee User ID
 *     responses:
 *       200:
 *         description: Attendee approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the event organizer
 *       404:
 *         description: Event or attendee not found
 */
router.post('/:id/attendees/:attendeeId/approve', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id, attendeeId } = req.params;
    const userId = req.user!.id;

    // Check if user is the organizer of this event
    const event = await prisma.events.findUnique({
      where: { id },
      select: { organizerId: true, name: true }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.organizerId !== userId) {
      return res.status(403).json({ error: 'Only event organizer can approve attendees' });
    }

    // Update attendee status
    const participant = await prisma.event_participants.update({
      where: {
        eventId_userId: {
          eventId: id,
          userId: attendeeId
        }
      },
      data: { status: 'confirmed' },
      include: {
        users: {
          select: { name: true, email: true }
        }
      }
    });

    // Update attendee count
    await prisma.events.update({
      where: { id },
      data: { attendeeCount: { increment: 1 } }
    });

    // Send notification to the user
    await NotificationService.createNotification({
      userId: attendeeId,
      type: NotificationType.REGISTRATION_APPROVED,
      title: 'Registration Approved',
      message: `Your registration for "${event.name}" has been approved!`,
      eventId: id
    });

    res.json({ 
      message: 'Attendee approved successfully',
      attendee: {
        id: attendeeId,
        name: participant.users.name,
        email: participant.users.email,
        status: participant.status
      }
    });
  } catch (error) {
    console.error('Approve attendee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/events/{id}/attendees/{attendeeId}/reject:
 *   post:
 *     summary: Reject an attendee registration
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *       - in: path
 *         name: attendeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendee User ID
 *     responses:
 *       200:
 *         description: Attendee rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the event organizer
 *       404:
 *         description: Event or attendee not found
 */
router.post('/:id/attendees/:attendeeId/reject', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id, attendeeId } = req.params;
    const userId = req.user!.id;

    // Check if user is the organizer of this event
    const event = await prisma.events.findUnique({
      where: { id },
      select: { organizerId: true, name: true }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.organizerId !== userId) {
      return res.status(403).json({ error: 'Only event organizer can reject attendees' });
    }

    // Update attendee status
    const participant = await prisma.event_participants.update({
      where: {
        eventId_userId: {
          eventId: id,
          userId: attendeeId
        }
      },
      data: { status: 'rejected' },
      include: {
        users: {
          select: { name: true, email: true }
        }
      }
    });

    // Send notification to the user
    await NotificationService.createNotification({
      userId: attendeeId,
      type: NotificationType.REGISTRATION_REJECTED,
      title: 'Registration Rejected',
      message: `Your registration for "${event.name}" has been rejected.`,
      eventId: id
    });

    res.json({ 
      message: 'Attendee rejected successfully',
      attendee: {
        id: attendeeId,
        name: participant.users.name,
        email: participant.users.email,
        status: participant.status
      }
    });
  } catch (error) {
    console.error('Reject attendee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/events/{id}/join-status:
 *   get:
 *     summary: Check if the current user has joined the event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Join status of the user for the event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isJoined:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   enum: [joined, left, not_joined]
 *                   example: "joined"
 *                 joinedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-16T10:30:00Z"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Authentication required"
 *       404:
 *         description: Event not found
 */
router.get('/:id/join-status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const registration = await prisma.event_participants.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId
        }
      }
    });

    const isJoined = registration && registration.status === 'confirmed' && registration.role === 'ATTENDEE';

    res.json({ 
      isJoined,
      status: registration?.status || 'not_registered',
      registeredAt: registration?.registeredAt || null,
      role: registration?.role || null
    });
  } catch (error) {
    console.error('Check join status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create test events for development
router.post('/create-test-events', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ error: 'This endpoint is only available in development' });
    }

    // Create a test user first
    const testUser = await prisma.users.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        name: 'Test Organizer',
        email: 'test@example.com',
        password: 'hashedpassword123'
      }
    });

    // Create test events
    const testEvents = [
      {
        name: 'React Workshop 2025',
        description: 'Learn the latest React features and best practices in this hands-on workshop.',
        location: 'Tech Hub Jakarta',
        startDate: new Date('2025-01-15T10:00:00Z'),
        endDate: new Date('2025-01-15T17:00:00Z'),
        capacity: 50,
        tags: ['React', 'JavaScript', 'Workshop'],
        organizerId: testUser.id
      },
      {
        name: 'Startup Networking Event',
        description: 'Connect with entrepreneurs, investors, and startup enthusiasts.',
        location: 'Co-working Space Bandung',
        startDate: new Date('2025-01-20T18:00:00Z'),
        endDate: new Date('2025-01-20T21:00:00Z'),
        capacity: 100,
        tags: ['Startup', 'Networking', 'Business'],
        organizerId: testUser.id
      },
      {
        name: 'AI & Machine Learning Conference',
        description: 'Explore the future of AI and machine learning with industry experts.',
        location: 'Convention Center Surabaya',
        startDate: new Date('2025-02-01T09:00:00Z'),
        endDate: new Date('2025-02-01T18:00:00Z'),
        capacity: 200,
        tags: ['AI', 'Machine Learning', 'Conference'],
        organizerId: testUser.id
      }
    ];

    const createdEvents = await Promise.all(
      testEvents.map(event => prisma.events.create({ data: event }))
    );

    res.json({ 
      message: 'Test events created successfully',
      events: createdEvents 
    });
  } catch (error) {
    console.error('Create test events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
