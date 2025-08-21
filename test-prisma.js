import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Test the connection by fetching the first user
    const user = await prisma.user.findFirst();
    console.log('Successfully connected to the database');
    console.log('First user:', user);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();