import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Evently API',
      version: '1.0.0',
      description: 'API documentation for Evently - Event management system',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://evently-backend-amber.vercel.app/'
          : 'http://localhost:3001',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Local server',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Events', description: 'Event management endpoints' },
      { name: 'Users', description: 'User profile and event endpoints' }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'User ID' },
            name: { type: 'string', description: 'User name' },
            email: { type: 'string', format: 'email', description: 'User email' },
            bio: { type: 'string', nullable: true, description: 'User bio' },
            profileImageUrl: { type: 'string', format: 'uri', nullable: true, description: 'Profile image URL' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
          }
        },
        Event: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Event ID' },
            name: { type: 'string', description: 'Event name' },
            description: { type: 'string', nullable: true, description: 'Event description' },
            location: { type: 'string', nullable: true, description: 'Event location' },
            visibility: { type: 'boolean', description: 'Whether event is public' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Event tags' },
            imageUrl: { type: 'string', format: 'uri', nullable: true, description: 'Event image URL' },
            status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'], description: 'Event status' },
            requireApproval: { type: 'boolean', description: 'Whether registration requires approval' },
            capacity: { type: 'integer', nullable: true, description: 'Maximum attendees' },
            attendeeCount: { type: 'integer', description: 'Current attendee count' },
            startDate: { type: 'string', format: 'date-time', description: 'Event start date' },
            endDate: { type: 'string', format: 'date-time', description: 'Event end date' },
            registrationStartDate: { type: 'string', format: 'date-time', description: 'Registration start date' },
            registrationEndDate: { type: 'string', format: 'date-time', nullable: true, description: 'Registration end date' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' },
            organizerId: { type: 'string', description: 'Organizer user ID' },
            organizer: { $ref: '#/components/schemas/User' },
            feedbackCount: { type: 'integer', description: 'Number of feedback entries' },
            feedbackAverageRating: { type: 'number', description: 'Average feedback rating' }
          }
        },
        EventInput: {
          type: 'object',
          required: ['name', 'startDate', 'endDate'],
          properties: {
            name: { type: 'string', minLength: 1, description: 'Event name' },
            description: { type: 'string', description: 'Event description' },
            location: { type: 'string', description: 'Event location' },
            startDate: { type: 'string', format: 'date-time', description: 'Event start date' },
            endDate: { type: 'string', format: 'date-time', description: 'Event end date' },
            capacity: { type: 'integer', minimum: 1, description: 'Maximum attendees' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Event tags' },
            visibility: { type: 'boolean', default: true, description: 'Whether event is public' },
            requireApproval: { type: 'boolean', default: false, description: 'Whether registration requires approval' },
            imageUrl: { type: 'string', format: 'uri', description: 'Event image URL' }
          }
        },
        EventParticipant: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Participant ID' },
            role: { type: 'string', enum: ['ATTENDEE', 'SPEAKER', 'ORGANIZER', 'MANAGER'], description: 'Participant role' },
            status: { type: 'string', default: 'confirmed', description: 'Participation status' },
            eventId: { type: 'string', description: 'Event ID' },
            userId: { type: 'string', description: 'User ID' },
            user: { $ref: '#/components/schemas/User' },
            registeredAt: { type: 'string', format: 'date-time', description: 'Registration timestamp' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
          }
        },
        EventsResponse: {
          type: 'object',
          properties: {
            events: {
              type: 'array',
              items: { $ref: '#/components/schemas/Event' }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', description: 'Current page' },
                limit: { type: 'integer', description: 'Items per page' },
                total: { type: 'integer', description: 'Total items' },
                totalPages: { type: 'integer', description: 'Total pages' }
              }
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', description: 'User email' },
            password: { type: 'string', description: 'User password' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', minLength: 2, description: 'User name' },
            email: { type: 'string', format: 'email', description: 'User email' },
            password: { type: 'string', minLength: 6, description: 'User password' }
          }
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 2, description: 'User name' },
            bio: { type: 'string', description: 'User bio' },
            profileImageUrl: { type: 'string', format: 'uri', description: 'Profile image URL' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
            token: { type: 'string', description: 'JWT token' }
          }
        },
        MessageResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Success message' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Error message' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  msg: { type: 'string' },
                  param: { type: 'string' },
                  location: { type: 'string' }
                }
              }
            }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  msg: { type: 'string', description: 'Error message' },
                  param: { type: 'string', description: 'Parameter name' },
                  location: { type: 'string', description: 'Parameter location' }
                }
              }
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. The token is obtained from the login endpoint (/auth/login) upon successful authentication. Example: "Authorization: Bearer {token}"'
        }
      }
    },
  },
  apis: [
    './src/routes/*.ts',
    './src/routes/*.js',
    './dist/src/routes/*.js'
  ], // Path to the API docs
};

export const swaggerSpec = swaggerJsDoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export { swaggerUi };
