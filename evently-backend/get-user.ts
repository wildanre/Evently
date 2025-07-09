import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getFirstUser() {
  try {
    const user = await prisma.users.findFirst();
    console.log('First user:', user);
  } catch (error) {
    console.error('Error getting user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getFirstUser();
