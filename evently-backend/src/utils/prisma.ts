import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a new PrismaClient instance with connection handling options
export const prisma = globalForPrisma.prisma ?? 
  new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    }
  });

// Save the client instance in development to avoid multiple instances
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Add proper disconnect handling
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
