import express, { Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { prisma } from '../utils/prisma';
import { authenticateToken } from '../middleware/auth';
import { 
  AuthRequest, 
  NotificationType,
  CreateNotificationData
} from '../types';

const router: express.Router = express.Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications with filtering and pagination
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
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
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [EVENT_CREATED, EVENT_UPDATED, EVENT_CANCELLED, EVENT_REMINDER, REGISTRATION_CONFIRMED, REGISTRATION_APPROVED, REGISTRATION_REJECTED, FEEDBACK_REQUEST, GENERAL]
 *         description: Filter by notification type
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('isRead').optional().isBoolean().withMessage('isRead must be a boolean'),
  query('type').optional().isString()
], authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const isRead = req.query.isRead as string;
    const type = req.query.type as NotificationType;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: req.user!.id
    };

    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    if (type) {
      where.type = type;
    }

    const [notifications, total] = await Promise.all([
      prisma.notifications.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.notifications.count({ where })
    ]);

    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 *       403:
 *         description: Access denied
 */
router.patch('/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notifications.findUnique({
      where: { id }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedNotification = await prisma.notifications.update({
      where: { id },
      data: { isRead: true },
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

    res.json(updatedNotification);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch('/mark-all-read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notifications.updateMany({
      where: {
        userId: req.user!.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get unread notifications count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notifications count
 */
router.get('/unread-count', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const count = await prisma.notifications.count({
      where: {
        userId: req.user!.id,
        isRead: false
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a new notification (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - type
 *               - userId
 *             properties:
 *               title:
 *                 type: string
 *                 description: Notification title
 *                 example: "Event Registration Confirmed"
 *               message:
 *                 type: string
 *                 description: Notification message
 *                 example: "Your registration for Tech Conference 2025 has been confirmed."
 *               type:
 *                 type: string
 *                 enum: [EVENT_CREATED, EVENT_UPDATED, EVENT_CANCELLED, EVENT_REMINDER, REGISTRATION_CONFIRMED, REGISTRATION_APPROVED, REGISTRATION_REJECTED, FEEDBACK_REQUEST, GENERAL]
 *                 description: Notification type
 *                 example: "REGISTRATION_CONFIRMED"
 *               userId:
 *                 type: string
 *                 description: Target user ID
 *                 example: "clx123abc456"
 *               eventId:
 *                 type: string
 *                 description: Related event ID (optional)
 *                 example: "clx456def789"
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Bad request - validation errors
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('message').trim().isLength({ min: 1 }).withMessage('Message is required'),
  body('type').isIn(Object.values(NotificationType)).withMessage('Invalid notification type'),
  body('userId').trim().isLength({ min: 1 }).withMessage('User ID is required'),
  body('eventId').optional().isString()
], authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, message, type, userId, eventId } = req.body;

    // Verify target user exists
    const targetUser = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return res.status(400).json({ error: 'Target user not found' });
    }

    // Verify event exists if eventId is provided
    if (eventId) {
      const event = await prisma.events.findUnique({
        where: { id: eventId }
      });

      if (!event) {
        return res.status(400).json({ error: 'Event not found' });
      }
    }

    const notification = await prisma.notifications.create({
      data: {
        title,
        message,
        type,
        userId,
        eventId
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

    res.status(201).json(notification);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 *       403:
 *         description: Access denied
 */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notifications.findUnique({
      where: { id }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.notifications.delete({
      where: { id }
    });

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

