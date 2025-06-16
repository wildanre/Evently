import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest, UpdateUserData } from '../types';

const router: express.Router = express.Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       404:
 *         description: User not found
 */
// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        profileImageUrl: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            events: true,
            event_participants: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *               bio:
 *                 type: string
 *               profileImageUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: User profile updated
 *       400:
 *         description: Validation errors
 *       500:
 *         description: Internal server error
 */
// Update user profile
interface UpdateProfileRequestBody {
    name?: string;
    bio?: string;
    profileImageUrl?: string;
}

interface UpdateProfileResponse {
    id: string;
    name: string;
    email: string;
    profileImageUrl: string | null;
    bio: string | null;
    updatedAt: Date;
}

router.put(
    '/profile',
    [
        body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
        body('bio').optional().isString(),
        body('profileImageUrl').optional().isURL().withMessage('Profile image must be a valid URL')
    ],
    authenticateToken,
    async (
        req: AuthRequest,
        res: express.Response<UpdateProfileResponse | { errors: any[] } | { error: string }>
    ) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, bio, profileImageUrl } = req.body as UpdateUserData;

            const updatedUser = await prisma.users.update({
                where: { id: req.user!.id },
                data: {
                    ...(name && { name }),
                    ...(bio !== undefined && { bio }),
                    ...(profileImageUrl !== undefined && { profileImageUrl })
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profileImageUrl: true,
                    bio: true,
                    updatedAt: true
                }
            });

            res.json(updatedUser);
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

/**
 * @swagger
 * /api/users/organized-events:
 *   get:
 *     summary: Get events organized by user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of organized events
 */
// Get user's organized events
router.get('/organized-events', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const events = await prisma.events.findMany({
      where: { organizerId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { event_participants_event_participants_eventIdToevents: true } }
      }
    });

    res.json(events);
  } catch (error) {
    console.error('Get organized events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/users/registered-events:
 *   get:
 *     summary: Get events registered by user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of registered events
 */
// Get user's registered events
router.get('/registered-events', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const registrations = await prisma.event_participants.findMany({
      where: { userId: req.user!.id },
      include: {
        events_event_participants_eventIdToevents: {
          include: {
            users: {
              select: { id: true, name: true, email: true }
            },
            _count: { select: { event_participants_event_participants_eventIdToevents: true } }
          }
        }
      },
      orderBy: { registeredAt: 'desc' }
    });

    const events = registrations.map((reg: typeof registrations[number]) => ({
      ...reg.events_event_participants_eventIdToevents,
      registrationRole: reg.role,
      registrationStatus: reg.status,
      registeredAt: reg.registeredAt
    }));

    res.json(events);
  } catch (error) {
    console.error('Get registered events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
