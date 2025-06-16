import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Evently API',
      version: '1.0.0',
      description: 'API documentation for Evently',
    },
    servers: [
      {
        url: 'https://evently-backend-seven.vercel.app/',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3001',
        description: 'Local server',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Events', description: 'Event management endpoints' },
      { name: 'Users', description: 'User profile and event endpoints' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsDoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export { swaggerUi };
