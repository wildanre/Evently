import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma';
import passport from '../config/passport';
import { CreateUserData, AuthResponse } from '../types';

const router: express.Router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User already exists with this email
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: Please provide a valid email
 *                       param:
 *                         type: string
 *                         example: email
 *                       location:
 *                         type: string
 *                         example: body
 */
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('connect')) {
        return res.status(500).json({ error: 'Database connection error' });
      }
      if (error.message.includes('Unique constraint')) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Validation error
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
 *                       msg:
 *                         type: string
 *                         example: Please provide a valid email
 *                       param:
 *                         type: string
 *                         example: email
 *                       location:
 *                         type: string
 *                         example: body
 *       401:
 *         description: Invalid credentials (wrong email or password)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid credentials
 */
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Google OAuth login
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth
 */
router.get('/google', (req, res, next) => {
  console.log('Initiating Google OAuth login');
  passport.authenticate('google', { 
    scope: ['profile', 'email']
  })(req, res, next);
});

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to frontend with token
 */
router.get('/google/callback',
  (req, res, next) => {
    console.log('Google OAuth callback received');
    passport.authenticate('google', { 
      failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
      failureMessage: true
    })(req, res, next);
  },
  async (req: express.Request, res: express.Response) => {
    try {
      console.log('Google OAuth callback - processing user');
      const user = req.user as any;
      
      if (!user) {
        console.error('No user found in Google OAuth callback');
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
      }

      console.log('Google OAuth user:', { id: user.id, email: user.email, name: user.name });
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      console.log('JWT token generated for Google OAuth user');

      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        profileImageUrl: user.profileImageUrl
      }))}`;
      
      console.log('Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
    }
  }
);

// Get OAuth login URL
router.get('/google/url', (req: express.Request, res: express.Response) => {
  // Force HTTPS in production (Vercel)
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
  const googleAuthUrl = `${protocol}://${req.get('host')}/api/auth/google`;
  res.json({ url: googleAuthUrl });
});

// Test OAuth configuration
router.get('/google/test', (req: express.Request, res: express.Response) => {
  const config = {
    clientID: process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Missing',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '✗ Missing',
    frontendURL: process.env.FRONTEND_URL || '✗ Missing',
    jwtSecret: process.env.JWT_SECRET ? '✓ Set' : '✗ Missing',
    sessionSecret: process.env.SESSION_SECRET ? '✓ Set' : '✗ Missing'
  };
  
  res.json({
    message: 'Google OAuth Configuration Check',
    config,
    status: Object.values(config).every(v => v.includes('✓')) ? 'Ready' : 'Issues Found'
  });
});

/**
 * @swagger
 * /api/auth/health:
 *   get:
 *     summary: Health check for authentication service
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Service health status
 */
router.get('/health', async (req: express.Request, res: express.Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const config = {
      database: '✓ Connected',
      jwtSecret: process.env.JWT_SECRET ? '✓ Set' : '✗ Missing',
      nodeEnv: process.env.NODE_ENV || 'development'
    };
    
    res.json({
      message: 'Authentication service health check',
      status: 'OK',
      timestamp: new Date().toISOString(),
      config
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      message: 'Authentication service health check',
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      config: {
        database: '✗ Connection failed',
        jwtSecret: process.env.JWT_SECRET ? '✓ Set' : '✗ Missing',
        nodeEnv: process.env.NODE_ENV || 'development'
      }
    });
  }
});

export default router;
