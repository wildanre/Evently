import express, { Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { prisma } from '../utils/prisma';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { 
  AuthRequest, 
  CreateEventData, 
  UpdateEventData, 
  EventFilters,
  PaginationResponse 
} from '../types';

const router: express.Router = express.Router();

// Get all events with filtering and pagination
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
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
        include: {
          organizer: {
            select: { id: true, name: true, email: true }
          },
          _count: { select: { attendees: true } }
        }
      }),
      prisma.event.count({ where })
    ]);

    res.json({
      events,
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

// Get single event
router.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { id: true, name: true, email: true, profileImageUrl: true }
        },
        attendees: {
          include: {
            user: {
              select: { id: true, name: true, profileImageUrl: true }
            }
          }
        },
        speakers: {
          include: {
            user: {
              select: { id: true, name: true, bio: true, profileImageUrl: true }
            }
          }
        },
        feedback: {
          include: {
            user: {
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

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new event
router.post('/', [
  body('name').trim().isLength({ min: 1 }).withMessage('Event name is required'),
  body('description').optional().isString(),
  body('location').optional().isString(),
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

    const event = await prisma.event.create({
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
        organizer: {
          select: { id: true, name: true, email: true }
        }
      }
    });

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
    const existingEvent = await prisma.event.findUnique({
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

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...updates,
        startDate: updates.startDate ? new Date(updates.startDate) : undefined,
        endDate: updates.endDate ? new Date(updates.endDate) : undefined
      },
      include: {
        organizer: {
          select: { id: true, name: true, email: true }
        }
      }
    });

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

    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.organizerId !== req.user!.id) {
      return res.status(403).json({ error: 'Only event organizer can delete this event' });
    }

    await prisma.event.delete({
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

    const event = await prisma.event.findUnique({
      where: { id },
      include: { _count: { select: { attendees: true } } }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if event is full
    if (event.capacity && event._count.attendees >= event.capacity) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Check if user is already registered
    const existingRegistration = await prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: req.user!.id
        }
      }
    });

    if (existingRegistration) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    // Register user
    await prisma.eventParticipant.create({
      data: {
        eventId: id,
        userId: req.user!.id,
        role: 'ATTENDEE'
      }
    });

    // Update attendee count
    await prisma.event.update({
      where: { id },
      data: { attendeeCount: { increment: 1 } }
    });

    res.json({ message: 'Successfully registered for event' });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unregister from event
router.delete('/:id/register', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await prisma.eventParticipant.findUnique({
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

    await prisma.eventParticipant.delete({
      where: {
        eventId_userId: {
          eventId: id,
          userId: req.user!.id
        }
      }
    });

    // Update attendee count
    await prisma.event.update({
      where: { id },
      data: { attendeeCount: { decrement: 1 } }
    });

    res.json({ message: 'Successfully unregistered from event' });
  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
