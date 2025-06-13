import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Evently API',
      version: '1.0.0',
      description: 'Event management system API documentation',
      contact: {
        name: 'Evently Team',
        email: 'support@evently.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server'
      },
      {
        url: 'https://api.evently.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User unique identifier'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            profileImageUrl: {
              type: 'string',
              format: 'uri',
              description: 'User profile image URL',
              nullable: true
            },
            bio: {
              type: 'string',
              description: 'User biography',
              nullable: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp'
            }
          },
          required: ['id', 'name', 'email']
        },
        Event: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Event unique identifier'
            },
            name: {
              type: 'string',
              description: 'Event name'
            },
            description: {
              type: 'string',
              description: 'Event description',
              nullable: true
            },
            location: {
              type: 'string',
              description: 'Event location',
              nullable: true
            },
            visibility: {
              type: 'boolean',
              description: 'Event visibility (public/private)'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Event tags'
            },
            imageUrl: {
              type: 'string',
              format: 'uri',
              description: 'Event image URL',
              nullable: true
            },
            status: {
              type: 'string',
              enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'],
              description: 'Event status'
            },
            requireApproval: {
              type: 'boolean',
              description: 'Whether event requires approval to join'
            },
            capacity: {
              type: 'integer',
              minimum: 1,
              description: 'Maximum number of attendees',
              nullable: true
            },
            attendeeCount: {
              type: 'integer',
              minimum: 0,
              description: 'Current number of attendees'
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Event start date and time'
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: 'Event end date and time'
            },
            registrationStartDate: {
              type: 'string',
              format: 'date-time',
              description: 'Registration start date'
            },
            registrationEndDate: {
              type: 'string',
              format: 'date-time',
              description: 'Registration end date',
              nullable: true
            },
            organizerId: {
              type: 'string',
              description: 'Event organizer user ID'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Event creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Event last update timestamp'
            }
          },
          required: ['id', 'name', 'startDate', 'endDate', 'organizerId']
        },
        CreateEventRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Event name',
              minLength: 1
            },
            description: {
              type: 'string',
              description: 'Event description'
            },
            location: {
              type: 'string',
              description: 'Event location'
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Event start date and time'
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: 'Event end date and time'
            },
            capacity: {
              type: 'integer',
              minimum: 1,
              description: 'Maximum number of attendees'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Event tags'
            },
            visibility: {
              type: 'boolean',
              description: 'Event visibility (public/private)',
              default: true
            },
            requireApproval: {
              type: 'boolean',
              description: 'Whether event requires approval to join',
              default: false
            },
            imageUrl: {
              type: 'string',
              format: 'uri',
              description: 'Event image URL'
            }
          },
          required: ['name', 'startDate', 'endDate']
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Response message'
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            token: {
              type: 'string',
              description: 'JWT authentication token'
            }
          },
          required: ['message', 'user', 'token']
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              description: 'User password',
              minLength: 6
            }
          },
          required: ['email', 'password']
        },
        RegisterRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'User full name',
              minLength: 2
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              description: 'User password',
              minLength: 6
            }
          },
          required: ['name', 'email', 'password']
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            events: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Event'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  minimum: 1,
                  description: 'Current page number'
                },
                limit: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 100,
                  description: 'Number of items per page'
                },
                total: {
                  type: 'integer',
                  minimum: 0,
                  description: 'Total number of items'
                },
                totalPages: {
                  type: 'integer',
                  minimum: 0,
                  description: 'Total number of pages'
                }
              },
              required: ['page', 'limit', 'total', 'totalPages']
            }
          },
          required: ['events', 'pagination']
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field name with error'
                  },
                  message: {
                    type: 'string',
                    description: 'Error message for the field'
                  }
                }
              },
              description: 'Validation errors'
            }
          },
          required: ['error']
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts'], // Path to the API files
};

export const specs = swaggerJsdoc(options);
export { swaggerUi };
