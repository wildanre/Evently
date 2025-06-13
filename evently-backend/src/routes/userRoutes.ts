import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router: express.Router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
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
            eventsOrganized: true,
            eventParticipation: true
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

            const { name, bio, profileImageUrl } = req.body;

            const updatedUser = await prisma.user.update({
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

// Get user's organized events
router.get('/organized-events', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { organizerId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { attendees: true } }
      }
    });

    res.json(events);
  } catch (error) {
    console.error('Get organized events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's registered events
router.get('/registered-events', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const registrations = await prisma.eventParticipant.findMany({
      where: { userId: req.user!.id },
      include: {
        event: {
          include: {
            organizer: {
              select: { id: true, name: true, email: true }
            },
            _count: { select: { attendees: true } }
          }
        }
      },
      orderBy: { registeredAt: 'desc' }
    });

    const events = registrations.map((reg: typeof registrations[number]) => ({
      ...reg.event,
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
