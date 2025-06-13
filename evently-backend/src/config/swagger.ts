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
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp'
            }
          },
          required: ['id', 'name', 'email']
        },
        UserProfile: {
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
            },
            _count: {
              type: 'object',
              properties: {
                eventsOrganized: {
                  type: 'integer',
                  description: 'Number of events organized by user'
                },
                eventParticipation: {
                  type: 'integer',
                  description: 'Number of events user is participating in'
                }
              }
            }
          }
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
            },
            organizer: {
              $ref: '#/components/schemas/User'
            },
            feedbackCount: {
              type: 'integer',
              description: 'Number of feedback submissions for the event'
            },
            feedbackAverageRating: {
              type: 'number',
              format: 'float',
              description: 'Average rating of the event from feedback'
            }
          },
          required: ['id', 'name', 'startDate', 'endDate', 'organizerId']
        },
        EventParticipant: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Participant unique identifier'
            },
            role: {
              type: 'string',
              enum: ['ATTENDEE', 'SPEAKER', 'ORGANIZER', 'MANAGER'],
              description: 'Role of the participant in the event'
            },
            status: {
              type: 'string',
              description: 'Participation status (confirmed, pending, etc.)'
            },
            eventId: {
              type: 'string',
              description: 'Event ID'
            },
            userId: {
              type: 'string',
              description: 'User ID'
            },
            registeredAt: {
              type: 'string',
              format: 'date-time',
              description: 'Registration timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            },
            user: {
              type: 'object',
              properties: {
                id: {
                  type: 'string'
                },
                name: {
                  type: 'string'
                },
                profileImageUrl: {
                  type: 'string',
                  nullable: true
                }
              }
            }
          }
        },
        EventFeedback: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Feedback unique identifier'
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Rating (1-5)'
            },
            comment: {
              type: 'string',
              description: 'Feedback comment',
              nullable: true
            },
            eventId: {
              type: 'string',
              description: 'Event ID'
            },
            userId: {
              type: 'string',
              description: 'User ID'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            }
          }
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
            },
            registrationStartDate: {
              type: 'string',
              format: 'date-time',
              description: 'Registration start date'
            },
            registrationEndDate: {
              type: 'string',
              format: 'date-time',
              description: 'Registration end date'
            }
          },
          required: ['name', 'startDate', 'endDate']
        },
        UpdateEventRequest: {
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
              description: 'Event visibility (public/private)'
            },
            requireApproval: {
              type: 'boolean',
              description: 'Whether event requires approval to join'
            },
            status: {
              type: 'string',
              enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'],
              description: 'Event status'
            },
            imageUrl: {
              type: 'string',
              format: 'uri',
              description: 'Event image URL'
            },
            registrationStartDate: {
              type: 'string',
              format: 'date-time',
              description: 'Registration start date'
            },
            registrationEndDate: {
              type: 'string',
              format: 'date-time',
              description: 'Registration end date'
            }
          }
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
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'User full name',
              minLength: 2
            },
            bio: {
              type: 'string',
              description: 'User biography'
            },
            profileImageUrl: {
              type: 'string',
              format: 'uri',
              description: 'User profile image URL'
            }
          }
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
        GoogleAuthUrlResponse: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'Google OAuth URL'
            }
          },
          required: ['url']
        },
        JoinEventRequest: {
          type: 'object',
          properties: {
            role: {
              type: 'string',
              enum: ['ATTENDEE', 'SPEAKER', 'MANAGER'],
              description: 'Role in the event',
              default: 'ATTENDEE'
            }
          }
        },
        SubmitFeedbackRequest: {
          type: 'object',
          properties: {
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Rating (1-5)'
            },
            comment: {
              type: 'string',
              description: 'Feedback comment'
            }
          },
          required: ['rating']
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
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      },
      {
        name: 'Users',
        description: 'User profile and management'
      },
      {
        name: 'Events',
        description: 'Event creation, management and participation'
      }
    ],
    paths: {
      '/auth/register': {
        post: {
          summary: 'Register a new user',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegisterRequest'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AuthResponse'
                  }
                }
              }
            },
            400: {
              description: 'Validation error or user already exists',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/auth/login': {
        post: {
          summary: 'Login user',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginRequest'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AuthResponse'
                  }
                }
              }
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            401: {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/auth/google': {
        get: {
          summary: 'Initiate Google OAuth flow',
          tags: ['Authentication'],
          responses: {
            302: {
              description: 'Redirects to Google OAuth consent screen'
            }
          }
        }
      },
      '/auth/google/callback': {
        get: {
          summary: 'Google OAuth callback',
          tags: ['Authentication'],
          responses: {
            302: {
              description: 'Redirects to frontend with token and user data'
            }
          }
        }
      },
      '/auth/google/url': {
        get: {
          summary: 'Get Google OAuth URL',
          tags: ['Authentication'],
          responses: {
            200: {
              description: 'Returns Google OAuth URL',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/GoogleAuthUrlResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/users/profile': {
        get: {
          summary: 'Get user profile',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'User profile data',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/UserProfile'
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized - missing or invalid token',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            404: {
              description: 'User not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        },
        put: {
          summary: 'Update user profile',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UpdateProfileRequest'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Profile updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized - missing or invalid token',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/events': {
        get: {
          summary: 'Get all events with filtering and pagination',
          tags: ['Events'],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: {
                type: 'integer',
                minimum: 1,
                default: 1
              },
              description: 'Page number'
            },
            {
              name: 'limit',
              in: 'query',
              schema: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
                default: 10
              },
              description: 'Number of items per page'
            },
            {
              name: 'search',
              in: 'query',
              schema: {
                type: 'string'
              },
              description: 'Search term to filter events by name, description, or location'
            },
            {
              name: 'tags',
              in: 'query',
              schema: {
                type: 'string'
              },
              description: 'Comma-separated list of tags to filter events'
            }
          ],
          responses: {
            200: {
              description: 'List of events with pagination',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/PaginationResponse'
                  }
                }
              }
            },
            400: {
              description: 'Invalid query parameters',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create a new event',
          tags: ['Events'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateEventRequest'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Event created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Event'
                  }
                }
              }
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized - missing or invalid token',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/events/{id}': {
        get: {
          summary: 'Get event by ID',
          tags: ['Events'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Event ID'
            }
          ],
          responses: {
            200: {
              description: 'Event details',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Event'
                  }
                }
              }
            },
            404: {
              description: 'Event not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        },
        put: {
          summary: 'Update event',
          tags: ['Events'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Event ID'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UpdateEventRequest'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Event updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Event'
                  }
                }
              }
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized - missing or invalid token',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            403: {
              description: 'Forbidden - not the organizer of the event',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            404: {
              description: 'Event not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        },
        delete: {
          summary: 'Delete event',
          tags: ['Events'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Event ID'
            }
          ],
          responses: {
            200: {
              description: 'Event deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Event deleted successfully'
                      }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized - missing or invalid token',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            403: {
              description: 'Forbidden - not the organizer of the event',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            404: {
              description: 'Event not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/events/{id}/join': {
        post: {
          summary: 'Join an event',
          tags: ['Events'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Event ID'
            }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/JoinEventRequest'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Joined event successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Joined event successfully'
                      },
                      participant: {
                        $ref: '#/components/schemas/EventParticipant'
                      }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Already joined or event at capacity',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized - missing or invalid token',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            404: {
              description: 'Event not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/events/{id}/leave': {
        post: {
          summary: 'Leave an event',
          tags: ['Events'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Event ID'
            }
          ],
          responses: {
            200: {
              description: 'Left event successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Left event successfully'
                      }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Not joined the event',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized - missing or invalid token',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            404: {
              description: 'Event not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/events/{id}/feedback': {
        post: {
          summary: 'Submit feedback for an event',
          tags: ['Events'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Event ID'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SubmitFeedbackRequest'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Feedback submitted successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/EventFeedback'
                  }
                }
              }
            },
            400: {
              description: 'Validation error or already submitted feedback',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized - missing or invalid token',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            403: {
              description: 'Forbidden - not an attendee of the event',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            404: {
              description: 'Event not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        },
        get: {
          summary: 'Get all feedback for an event',
          tags: ['Events'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Event ID'
            }
          ],
          responses: {
            200: {
              description: 'List of feedback for the event',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/EventFeedback'
                    }
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized - missing or invalid token',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            403: {
              description: 'Forbidden - not the organizer of the event',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            404: {
              description: 'Event not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts'], // Path to the API files
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };
