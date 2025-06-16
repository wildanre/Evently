import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import passport from '../src/config/passport';
import swaggerStaticRouter from '../src/swagger-static';

// Import routes
import authRoutes from '../src/routes/authRoutes';
import eventRoutes from '../src/routes/eventRoutes';
import userRoutes from '../src/routes/userRoutes';

// Load environment variables
dotenv.config();

const app = express();

// Rate limiting for Vercel
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware with relaxed CSP for Swagger UI
app.use('/api-docs', helmet({
  contentSecurityPolicy: false, // Disable CSP for Swagger UI route
}));

app.use('/swagger.json', helmet({
  contentSecurityPolicy: false, // Disable CSP for Swagger JSON route
}));

// Disable CSP for API endpoints when accessed from Swagger UI
app.use('/api', helmet({
  contentSecurityPolicy: false,
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https:", "https://unpkg.com"],
      connectSrc: ["'self'", "https:", "*"], // Allow all connections for API testing
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://unpkg.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
    },
  },
}));

// CORS configuration for production and development
const corsOptions = {
  origin: function (origin: any, callback: any) {
    // Always allow requests without origin (Swagger UI, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL,
      // Allow all Vercel domains for API documentation
      /\.vercel\.app$/,
    ].filter(Boolean);
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    // Always allow for API testing and development
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept', 
    'Origin', 
    'X-Requested-With',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200, // For legacy browser support
  preflightContinue: false,
};

app.use(cors(corsOptions));
app.use(limiter);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add Swagger static routes
app.use(swaggerStaticRouter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Evently Backend API is running',
    timestamp: new Date().toISOString(),
    documentation: `${req.protocol}://${req.get('host')}/api-docs`
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error:', error);
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Export for Vercel
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req as any, res as any);
};

